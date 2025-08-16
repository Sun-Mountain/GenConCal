use crate::domain;
use crate::domain::metadata::{Contact, EventType, GameSystem, Group, Materials, Website};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use crate::persistence::PG_PARAM_LIMIT;
use anyhow::{Context, Error};
use sqlx::{Postgres, Row};

/// Persists or retrieves unique event type strings
pub struct DbEventTypeSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i32, EventType> for DbEventTypeSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<EventType>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading event types")?;

        let mut fetched_rows: Vec<Option<EventType>> = Vec::with_capacity(names.len());

        for name in names.iter() {
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

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving event types")?;

        let mut saved_ids: Vec<i32> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO event_types(event_type)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save event types")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i32 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}

/// Persists or retrieves unique game system strings
pub struct DbGameSystemSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i64, GameSystem> for DbGameSystemSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<GameSystem>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading game systems")?;

        let mut fetched_rows: Vec<Option<GameSystem>> = Vec::with_capacity(names.len());

        for name in names.iter() {
            let name_id = sqlx::query!("SELECT id FROM game_systems WHERE system_name = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| GameSystem {
                id: row.id,
                system_name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving game systems")?;

        let mut saved_ids: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO game_systems(system_name)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save game systems")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i64 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}

/// Persists or retrieves unique contact email strings
pub struct DbContactSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i64, Contact> for DbContactSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<Contact>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading contacts")?;

        let mut fetched_rows: Vec<Option<Contact>> = Vec::with_capacity(names.len());

        for name in names.iter() {
            let name_id = sqlx::query!("SELECT id FROM contacts WHERE contact_email = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| Contact {
                id: row.id,
                email: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving contacts")?;

        let mut saved_ids: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO contacts(contact_email)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save contacts")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i64 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}

/// UniqueStringSaver implementation for organizing groups.
pub struct DbGroupSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i64, Group> for DbGroupSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<Group>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading groups")?;

        let mut fetched_rows: Vec<Option<Group>> = Vec::with_capacity(names.len());

        for name in names.iter() {
            let name_id = sqlx::query!("SELECT id FROM groups WHERE group_name = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| Group {
                id: row.id,
                name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving groups")?;

        let mut saved_ids: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO groups(group_name)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save groups")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i64 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}

/// UniqueStringSaver implementation for event websites.
pub struct DbWebsiteSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i64, Website> for DbWebsiteSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<Website>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading websites")?;

        let mut fetched_rows: Vec<Option<Website>> = Vec::with_capacity(names.len());

        for name in names.iter() {
            let name_id = sqlx::query!("SELECT id FROM websites WHERE url = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| Website {
                id: row.id,
                url: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving websites")?;

        let mut saved_ids: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO websites(url)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save websites")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i64 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}

/// UniqueStringSaver implementation for required materials at events.
pub struct DbMaterialsSaver;

impl domain::unique::driven_ports::UniqueStringSaver<i64, Materials> for DbMaterialsSaver {
    #[tracing::instrument(skip_all, fields(first_5 = ?names.get(0..5), total = names.len()))]
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<Materials>>, Error> {
        let mut cxn_handle = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for reading materials")?;

        let mut fetched_rows: Vec<Option<Materials>> = Vec::with_capacity(names.len());

        for name in names.iter() {
            let name_id = sqlx::query!("SELECT id FROM materials WHERE summary = $1", name)
                .fetch_optional(cxn_handle.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| Materials {
                id: row.id,
                summary: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    #[tracing::instrument(skip_all, fields(first_5 = ?new_names.get(0..5), total = new_names.len()))]
    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Fetching connection for saving materials")?;

        let mut saved_ids: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(PG_PARAM_LIMIT) {
            let mut query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO materials(summary)");

            query_builder.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            query_builder.push(" RETURNING id");

            let fetched_ids = query_builder
                .build()
                .fetch_all(cxn.borrow_connection())
                .await
                .context("Bulk save materials")?;
            saved_ids.extend(
                fetched_ids
                    .into_iter()
                    .map(|fetched_id| -> i64 { fetched_id.get("id") }),
            );
        }

        Ok(saved_ids)
    }
}
