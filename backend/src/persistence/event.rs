use std::collections::HashMap;
use anyhow::{Context, Error};
use chrono::Datelike;
use sqlx::{Postgres, Row};
use crate::domain;
use crate::domain::event::{AgeRequirement, CreateParams, ExperienceLevel, UpdateParams};
use crate::domain::location::RefType;
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use crate::persistence::u16_as_i16;

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

fn experience_level_to_db_enum(experience_level: ExperienceLevel) -> &'static str {
    match experience_level {
        ExperienceLevel::Some => "Some",
        ExperienceLevel::None => "None",
        ExperienceLevel::Expert => "Expert",
    }
}

fn age_reqt_to_db_enum(age_requirement: AgeRequirement) -> &'static str {
    match age_requirement {
        AgeRequirement::Everyone => "Everyone",
        AgeRequirement::KidsOnly => "KidsOnly",
        AgeRequirement::Teen => "Teen",
        AgeRequirement::Mature => "Mature",
        AgeRequirement::Adult => "Adult",
    }
}

pub struct DbEventWriter;

const SINGLE_EVENT_INSERT_PARAMS_LEN: usize = 18;
const EVENT_INSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / SINGLE_EVENT_INSERT_PARAMS_LEN;

struct GameLocation {
    id: i64,
    loc_id: i32,
}

impl domain::event::driven_ports::EventWriter for DbEventWriter {
    async fn bulk_save_events(&self, create_params: &[CreateParams<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Trying to acquire connection to bulk insert events")?;
        
        
        for insert_chunk in create_params.chunks(EVENT_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new(r#"
                INSERT INTO events(
                    game_id, event_type_id, game_system_id, title,
                    description, start, end, cost, tickets_available,
                    min_players, max_players, experience_levelage_requirement,
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
                    .push_bind(event_create.cost.map(u16_as_i16))
                    .push_bind(event_create.tickets_available as i16)
                    .push_bind(event_create.min_players as i16)
                    .push_bind(event_create.max_players as i16)
                    .push_bind(event_create.age_requirement as i16)
                    .push_bind(experience_level_to_db_enum(event_create.experience_level))
                    .push_bind(age_reqt_to_db_enum(event_create.age_requirement))
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
                match insert_chunk[idx].location {
                    Some(domain::location::Ref { id: loc_id, ref_type: RefType::Location}) => buildings_to_insert.push(GameLocation { id, loc_id }),
                    Some(domain::location::Ref { id: loc_id, ref_type: RefType::Room}) => rooms_to_insert.push(GameLocation { id, loc_id }),
                    Some(domain::location::Ref { id: loc_id, ref_type: RefType::Section}) => sections_to_insert.push(GameLocation { id, loc_id }),
                    None => {/* Do nothing */}
                }
            }
            
            if !buildings_to_insert.is_empty() {
                todo!();
            }
            
            if !rooms_to_insert.is_empty() {
                todo!();
            }
            
            if !sections_to_insert.is_empty() {
                todo!();
            }
        }
        
        Ok(Vec::new())
    }

    async fn bulk_update_events(&self, update_params: &[(i64, UpdateParams<'_>)], ext_cxn: &mut impl ExternalConnectivity) -> Result<(), Error> {
        todo!()
    }
}