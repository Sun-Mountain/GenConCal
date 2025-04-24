use anyhow::Error;
use crate::domain;
use crate::domain::event::{CreateParams, UpdateParams};

pub struct DbEventDetector;

impl domain::event::driven_ports::EventDetector for DbEventDetector {
    async fn bulk_event_id_exists(&self, gencon_event_id: &[&str]) -> Result<Vec<Option<i32>>, Error> {
        todo!()
    }
}

pub struct DbEventWriter;

impl domain::event::driven_ports::EventWriter for DbEventWriter {
    async fn bulk_save_events(&self, create_params: &[CreateParams<'_>]) -> Result<Vec<i32>, Error> {
        todo!()
    }

    async fn bulk_update_events(&self, update_params: &[(i32, UpdateParams<'_>)]) -> Result<(), Error> {
        todo!()
    }
}