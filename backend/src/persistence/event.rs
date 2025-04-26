use std::collections::HashMap;
use anyhow::{Context, Error};
use chrono::Datelike;
use crate::domain;
use crate::domain::event::{AgeRequirement, CreateParams, ExperienceLevel, UpdateParams};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};

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

impl domain::event::driven_ports::EventWriter for DbEventWriter {
    async fn bulk_save_events(&self, create_params: &[CreateParams<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Retrieving database connection to save events")?;
        
        let mut saved_ids: Vec<i64> = Vec::with_capacity(create_params.len());
        
        for create_param in create_params.iter() {
            let age_req = AgeRequirementDTO::from(create_param.age_requirement);
            let exp_req = ExperienceLevelDTO::from(create_param.experience_level);
            
            let inserted_id = sqlx::query_as!(
                i64, 
                r#"
                INSERT INTO events(
                    game_id, game_system_id, event_type_id, 
                    age_requirement, required_experience, table_number, 
                    materials_id, contact_id, website_id, group_id, 
                    title, description, start_dt, end_dt, 
                    year, cost, tickets_available, min_players, max_players
                ) 
                VALUES (
                    $1, $2, $3, 
                    $4, $5, $6, 
                    $7, $8, $9, $10, 
                    $11, $12, $13, $14, 
                    date_part('year', CURRENT_DATE), $15, $16, $17, $18
                ) 
                RETURNING id
                "#,
                create_param.game_id, create_param.game_system_id, create_param.event_type_id,
                age_req, exp_req, create_param.table_number,
                create_param.materials_id, create_param.contact_id, create_param.website_id, create_param.group_id,
                create_param.title, create_param.description, create_param.start_dt, create_param.end_dt,
                create_param.cost, create_param.tickets_available, create_param.min_players, create_param.max_players
            ).fetch_one()
                .context("Inserting a new event into the database")?;
            
            // TODO save the ID and cantinue from here
        }
        
        Ok(saved_ids)
    }

    async fn bulk_update_events(&self, update_params: &[(i64, UpdateParams<'_>)], ext_cxn: &mut impl ExternalConnectivity) -> Result<(), Error> {
        todo!()
    }
}