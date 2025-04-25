use std::collections::HashMap;
use anyhow::{Context, Error};
use chrono::Datelike;
use crate::domain;
use crate::domain::event::{CreateParams, UpdateParams};
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

pub struct DbEventWriter;

impl domain::event::driven_ports::EventWriter for DbEventWriter {
    async fn bulk_save_events(&self, create_params: &[CreateParams<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i64>, Error> {
        todo!()
    }

    async fn bulk_update_events(&self, update_params: &[(i64, UpdateParams<'_>)], ext_cxn: &mut impl ExternalConnectivity) -> Result<(), Error> {
        todo!()
    }
}