use crate::domain;
use crate::domain::metadata::{Contact, EventType, GameSystem, Group, Website};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{Context, Error};
use sqlx::{Postgres, Row};

const PG_PARAM_LIMIT: usize = 65535;

pub struct DbEventTypeSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, EventType> for DbEventTypeSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<EventType>>, Error> {
        let mut cxn_handle = ext_cxn.database_cxn()
            .await.context("Fetching connection for reading event types")?;

        let mut fetched_rows: Vec<Option<EventType>> = Vec::with_capacity(names.len());

        for name in names.iter().cloned() {
            let name_id = sqlx::query!("SELECT id FROM event_types WHERE event_type = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| EventType {
                id: row.id,
                name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn.database_cxn()
            .await.context("Fetching connection for saving event types")?;

        let mut saved_ids: Vec<i32> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new("INSERT INTO event_types(event_type) VALUES ");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder.build().fetch_all(cxn.borrow_connection()).await.context("Bulk save event types")?;
            saved_ids.extend(fetched_ids.into_iter().map(|fetched_id| -> i32 { fetched_id.get("id") }));
        }

        Ok(saved_ids)
    }
}

pub struct DbGameSystemSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, GameSystem> for DbGameSystemSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<GameSystem>>, Error> {
        todo!()
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}

pub struct DbContactSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, Contact> for DbContactSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<Contact>>, Error> {
        todo!()
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}

pub struct DbGroupSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, Group> for DbGroupSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<Group>>, Error> {
        todo!()
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}

pub struct DbWebsiteSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, Website> for DbWebsiteSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<Website>>, Error> {
        todo!()
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}

pub struct DbMaterialsSaver;

impl domain::metadata::driven_ports::UniqueStringSaver<i32, Website> for DbMaterialsSaver {
    async fn read_matching(&self, names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<Website>>, Error> {
        todo!()
    }

    async fn bulk_save(&self, new_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}