use std::collections::HashMap;
use anyhow::{Context, Error};
use chrono::Datelike;
use sqlx::{Postgres, Row};
use crate::domain;
use crate::domain::event::{AgeRequirement, CreateParams, ExperienceLevel, UpdateParams};
use crate::domain::location;
use crate::domain::location::RefType;
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use crate::persistence::{u16_as_i16, u32_as_i32};

struct GameIdAndId {
    game_id: String,
    id: i64,
}

pub struct DbEventDetector;

impl domain::event::driven_ports::EventDetector for DbEventDetector {
    async fn bulk_event_id_exists(&self, gencon_event_id: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<i64>>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Trying to acquire connection to bulk detect events")?;
        
        let event_id_strings: Vec<String> = gencon_event_id.iter().map(|id| id.to_string()).collect();
        let current_year = chrono::Local::now().year() as i16;
        let mut detected_db_ids: Vec<Option<i64>> = vec![None; gencon_event_id.len()];
        let event_id_to_idx: HashMap<&str, usize> = gencon_event_id.iter()
            .enumerate()
            .map(|(idx, event_id)| (*event_id, idx))
            .collect();
        
        let located_ids: Vec<GameIdAndId> = sqlx::query_as!(GameIdAndId, "SELECT id, game_id from events WHERE game_id = ANY($1) AND year = $2", event_id_strings.as_slice(), current_year)
            .fetch_all(cxn.borrow_connection())
            .await
            .context("Looking up event availability in database")?;
        
        for id in located_ids.into_iter() {
            detected_db_ids[event_id_to_idx[&id.game_id.as_str()]] = Some(id.id);
        }
        
        Ok(detected_db_ids)
    }
}

#[derive(sqlx::Type)]
#[sqlx(type_name = "agerequirement")]
#[sqlx(rename_all = "PascalCase")]
enum AgeRequirementDTO {
    Everyone,
    KidsOnly,
    Teen,
    Mature,
    Adult,
}

impl From<AgeRequirement> for AgeRequirementDTO {
    fn from(age_req: AgeRequirement) -> Self {
        match age_req {
            AgeRequirement::Everyone => AgeRequirementDTO::Everyone,
            AgeRequirement::KidsOnly => AgeRequirementDTO::KidsOnly,
            AgeRequirement::Teen => AgeRequirementDTO::Teen,
            AgeRequirement::Mature => AgeRequirementDTO::Mature,
            AgeRequirement::Adult => AgeRequirementDTO::Adult,
        }
    }
}

#[derive(sqlx::Type)]
#[sqlx(type_name = "experiencerequirement")]
#[sqlx(rename_all = "PascalCase")]
enum ExperienceLevelDTO {
    Some,
    None,
    Expert,
}

impl From<ExperienceLevel> for ExperienceLevelDTO {
    fn from(exp_req: ExperienceLevel) -> Self {
        match exp_req {
            ExperienceLevel::None => ExperienceLevelDTO::None,
            ExperienceLevel::Some => ExperienceLevelDTO::Some,
            ExperienceLevel::Expert => ExperienceLevelDTO::Expert,
        }
    }
}

pub struct DbEventWriter;

const SINGLE_EVENT_INSERT_PARAMS_LEN: usize = 18;
const EVENT_INSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / SINGLE_EVENT_INSERT_PARAMS_LEN;

const SINGLE_EVENT_UPDATE_PARAMS_LEN: usize = 18;
const EVENT_UPDATE_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / SINGLE_EVENT_UPDATE_PARAMS_LEN;

struct GameLocation {
    id: i64,
    loc_id: i32,
}

impl domain::event::driven_ports::EventWriter for DbEventWriter {
    async fn bulk_save_events(&self, create_params: &[CreateParams<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Trying to acquire connection to bulk insert events")?;
        let mut all_inserted_ids: Vec<i64> = Vec::with_capacity(create_params.len());
        
        for insert_chunk in create_params.chunks(EVENT_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new(r#"
                INSERT INTO events(
                    game_id, event_type_id, game_system_id, title,
                    description, start, end, cost, tickets_available,
                    min_players, max_players, experience_level, age_requirement,
                    table_number, materials, contact, website, group
                ) VALUES
            "#);

            insert_query_builder.push_values(insert_chunk, |mut builder, event_create| {
                builder.push_bind(event_create.game_id)
                    .push_bind(event_create.event_type_id)
                    .push_bind(event_create.game_system_id)
                    .push_bind(event_create.title)
                    .push_bind(event_create.description)
                    .push_bind(event_create.start)
                    .push_bind(event_create.end)
                    .push_bind(event_create.cost.map(u32_as_i32))
                    .push_bind(event_create.tickets_available as i16)
                    .push_bind(event_create.min_players as i16)
                    .push_bind(event_create.max_players as i16)
                    .push_bind(event_create.age_requirement as i16)
                    .push_bind(ExperienceLevelDTO::from(event_create.experience_level))
                    .push_bind(AgeRequirementDTO::from(event_create.age_requirement))
                    .push_bind(event_create.table_number.map(u16_as_i16))
                    .push_bind(event_create.materials)
                    .push_bind(event_create.contact)
                    .push_bind(event_create.website)
                    .push_bind(event_create.group);
            });

            insert_query_builder.push(" RETURNING events.id");

            let inserted_id_rows = insert_query_builder.build().fetch_all(cxn.borrow_connection()).await.context("Inserting events into database")?;
            let inserted_ids: Vec<i64> = inserted_id_rows.into_iter().map(|row| row.get("id")).collect();

            let mut buildings_to_insert: Vec<GameLocation> = Vec::new();
            let mut rooms_to_insert: Vec<GameLocation> = Vec::new();
            let mut sections_to_insert: Vec<GameLocation> = Vec::new();

            for (idx, id) in inserted_ids.iter().cloned().enumerate() {
                if let Some(ref loc_ref) = create_params[idx].location {
                    let location_to_add = GameLocation {
                        id,
                        loc_id: loc_ref.id,
                    };
                    match loc_ref.ref_type {
                        RefType::Location => buildings_to_insert.push(location_to_add),
                        RefType::Room => rooms_to_insert.push(location_to_add),
                        RefType::Section => sections_to_insert.push(location_to_add),
                    }
                }
            }

            // We don't need to chunk these inserts since they're guaranteed to have fewer inputs
            // than the larger query to insert the events
            
            upsert_location_refs(&mut cxn, &buildings_to_insert, RefType::Location).await.context("Event insert")?;
            upsert_location_refs(&mut cxn, &rooms_to_insert, RefType::Room).await.context("Event insert")?;
            upsert_location_refs(&mut cxn, &rooms_to_insert, RefType::Section).await.context("Event insert")?;
            
            all_inserted_ids.extend(inserted_ids);
        }

        Ok(all_inserted_ids)
    }

    async fn bulk_update_events(&self, update_params: &[(i64, UpdateParams<'_>)], ext_cxn: &mut impl ExternalConnectivity) -> Result<(), Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Acquiring connection to bulk update events")?;
        let mut all_buildings: Vec<GameLocation> = Vec::new();
        let mut all_rooms: Vec<GameLocation> = Vec::new();
        let mut all_sections: Vec<GameLocation> = Vec::new();
        let mut event_ids_to_remove_location: Vec<i64> = Vec::new();
        
        for (id, update_params) in update_params.iter() {
            sqlx::query!(r#"
                UPDATE events
                SET event_type_id = $1
                    , game_system_id = $2
                    , title = $3
                    , description = $4
                    , start_dt = $5
                    , end_dt = $6
                    , cost = $7
                    , tickets_available = $8
                    , min_players = $9
                    , max_players = $10
                    , age_requirement = $11
                    , required_experience = $12
                    , table_number = $13
                    , materials_id = $14
                    , contact_id = $15
                    , website_id = $16
                    , group_id = $17
                WHERE id = $18
            "#,
                update_params.event_type_id,
                update_params.game_system_id,
                update_params.title,
                update_params.description,
                update_params.start,
                update_params.end,
                update_params.cost.map(u32_as_i32),
                update_params.tickets_available as i16,
                update_params.min_players as i16,
                update_params.max_players as i16,
                AgeRequirementDTO::from(update_params.age_requirement) as _,
                ExperienceLevelDTO::from(update_params.experience_requirement) as _,
                update_params.table_number.map(u16_as_i16),
                update_params.materials,
                update_params.contact,
                update_params.website,
                update_params.group,
                id,
            ).execute(cxn.borrow_connection())
                .await
                .context(format!("Updating event ID {id}"))?;
            
            if let Some(ref location) = update_params.location {
                let location_to_save = GameLocation {
                    id: *id,
                    loc_id: location.id,
                };
                match location.ref_type {
                    RefType::Location => all_buildings.push(location_to_save),
                    RefType::Room => all_rooms.push(location_to_save),
                    RefType::Section => all_sections.push(location_to_save),
                }
            } else {
                event_ids_to_remove_location.push(*id);
            }
        }
        
        upsert_location_refs_chunked(&mut cxn, &all_buildings, RefType::Location).await.context("Event update")?;
        upsert_location_refs_chunked(&mut cxn, &all_rooms, RefType::Room).await.context("Event update")?;
        upsert_location_refs_chunked(&mut cxn, &all_sections, RefType::Section).await.context("Event update")?;
        remove_location_refs_chunked(&mut cxn, &event_ids_to_remove_location).await.context("Event update")?;
        
        Ok(())
    }
}

const LOCATION_UPSERT_PARAMS: usize = 2;
const LOCATION_UPSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / LOCATION_UPSERT_PARAMS;

async fn upsert_location_refs_chunked(ext_cxn_handle: &mut impl ConnectionHandle, locations: &[GameLocation], ref_type: RefType) -> Result<(), Error> {
    if locations.is_empty() {
        return Ok(());
    }
    
    for chunk in locations.chunks(LOCATION_UPSERT_CHUNK_SIZE) {
        upsert_location_refs(&mut *ext_cxn_handle, chunk, ref_type).await?;
    }
    
    Ok(())
}

async fn upsert_location_refs(ext_cxn_handle: &mut impl ConnectionHandle, locations: &[GameLocation], ref_type: RefType) -> Result<(), Error> {
    if locations.is_empty() {
        return Ok(());
    }
    
    let insert_query = match ref_type {
        RefType::Location => "INSERT INTO event_location(event_id, location_id) VALUES ",
        RefType::Room => "INSERT INTO event_room(event_id, room_id) VALUES ",
        RefType::Section => "INSERT INTO event_section(event_id, section_id) VALUES ",
    };

    let mut insert_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new(insert_query);

    insert_builder.push_values(locations, |mut builder, game_location| {
        builder.push_bind(game_location.id)
            .push_bind(game_location.loc_id);
    });
    
    insert_builder.push(" ON CONFLICT DO NOTHING");

    insert_builder.build().execute(ext_cxn_handle.borrow_connection()).await
        .context(format!("Inserting {ref_type} connections into database"))?;
    
    Ok(())
}

async fn remove_location_refs_chunked(ext_cxn_handle: &mut impl ConnectionHandle, ids_to_remove_location: &[i64]) -> Result<(), Error> {
    if ids_to_remove_location.is_empty() {
        return Ok(());
    }
    
    for chunk in ids_to_remove_location.chunks(super::PG_PARAM_LIMIT)  {
        remove_location_refs(&mut *ext_cxn_handle, chunk).await?;
    }
    
    Ok(())
}

async fn remove_location_refs(ext_cxn_handle: &mut impl ConnectionHandle, ids_to_remove_location: &[i64]) -> Result<(), Error> {
    if ids_to_remove_location.is_empty() {
        return Ok(());
    }
    
    sqlx::query!("DELETE FROM event_location WHERE event_id = ANY($1)", ids_to_remove_location)
        .execute(ext_cxn_handle.borrow_connection())
        .await
        .context("Removing locations for events")?;
    sqlx::query!("DELETE FROM event_room WHERE event_id = ANY($1)", ids_to_remove_location)
        .execute(ext_cxn_handle.borrow_connection())
        .await
        .context("Removing rooms for events")?;
    sqlx::query!("DELETE FROM event_section WHERE event_id = ANY($1)", ids_to_remove_location)
        .execute(ext_cxn_handle.borrow_connection())
        .await
        .context("Removing sections for events")?;
    
    Ok(())
}
