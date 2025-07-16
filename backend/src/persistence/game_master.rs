use crate::domain::game_master::GameMaster;
use crate::domain::game_master::driven_ports::{
    ExistingAssociationError, GMAssociator, NewAssociationError,
};
use crate::domain::unique::driven_ports::UniqueStringSaver;
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{Context, Error};
use sqlx::{Postgres, Row};
use std::collections::HashSet;

pub struct GameMasterDbSaver;

impl UniqueStringSaver<i64, GameMaster> for GameMasterDbSaver {
    async fn read_matching(
        &self,
        names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<Option<GameMaster>>, Error> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .context("Retrieving DB connection to read game master names")?;

        let mut results: Vec<Option<GameMaster>> = Vec::with_capacity(names.len());

        for name in names {
            let id_for_name = sqlx::query!("SELECT id FROM game_masters WHERE gm_name = $1", name)
                .fetch_optional(db_cxn.borrow_connection())
                .await
                .with_context(|| format!("Retrieving game master ID for name {name}"))?;

            results.push(id_for_name.map(|id_record| GameMaster {
                id: id_record.id,
                name: name.to_string(),
            }))
        }

        Ok(results)
    }

    async fn bulk_save(
        &self,
        new_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, Error> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .context("Retrieving DB connection to save game master names")?;

        let mut results: Vec<i64> = Vec::with_capacity(new_names.len());

        for name_chunk in new_names.chunks(super::PG_PARAM_LIMIT) {
            let mut bulk_insert_query: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO game_masters(gm_name) ");

            bulk_insert_query.push_values(name_chunk, |mut builder, name| {
                builder.push_bind(name);
            });

            bulk_insert_query.push(" RETURNING id");
            let saved_ids = bulk_insert_query
                .build()
                .fetch_all(db_cxn.borrow_connection())
                .await
                .context("Saving game master names")?;

            results.extend(saved_ids.into_iter().map(|row| row.get::<i64, _>("id")));
        }

        Ok(results)
    }
}

pub struct GameMasterDbAssociator;

struct EventIdDTO {
    event_id: i64,
}

impl GMAssociator for GameMasterDbAssociator {
    #[tracing::instrument(skip(self, ext_cxn))]
    async fn existing_gm_associations(
        &self,
        game_id: i64,
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, ExistingAssociationError> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .with_context(|| format!("Retrieving DB connection to read GMs for game {game_id}"))
            .map_err(ExistingAssociationError::PortError)?;

        let game_exists_opt = sqlx::query!(
            "SELECT 1 as exists FROM events WHERE events.id = $1",
            game_id
        )
        .fetch_optional(db_cxn.borrow_connection())
        .await
        .with_context(|| format!("Detecting if event {game_id} exists before GM retrieval"))
        .map_err(ExistingAssociationError::PortError)?;
        game_exists_opt.ok_or_else(|| ExistingAssociationError::GameDoesNotExist(game_id))?;

        let associated_gms = sqlx::query_as!(
            EventIdDTO,
            "SELECT event_id FROM event_game_masters WHERE event_id = $1",
            game_id
        )
        .fetch_all(db_cxn.borrow_connection())
        .await
        .with_context(|| format!("Retrieving GMs for game {game_id}"))
        .map_err(ExistingAssociationError::PortError)?;

        Ok(associated_gms.into_iter().map(|dto| dto.event_id).collect())
    }

    #[tracing::instrument(skip(self, ext_cxn))]
    async fn associate_gms_with_game(
        &self,
        game_id: i64,
        game_master_ids: &[i64],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<(), NewAssociationError> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .with_context(|| format!("Saving new GMs for game {game_id}"))
            .map_err(NewAssociationError::PortError)?;

        // Detect if necessary data exists
        let game_exists_opt = sqlx::query!(
            "SELECT 1 as exists FROM events WHERE events.id = $1",
            game_id
        )
        .fetch_optional(db_cxn.borrow_connection())
        .await
        .with_context(|| format!("Detecting if event {game_id} exists before GM association"))
        .map_err(NewAssociationError::PortError)?;
        game_exists_opt.ok_or_else(|| NewAssociationError::GameDoesNotExist(game_id))?;

        let existing_gms = sqlx::query_as!(
            super::NewId,
            r#"SELECT id FROM game_masters WHERE game_masters.id = ANY($1)"#,
            game_master_ids
        )
        .fetch_all(db_cxn.borrow_connection())
        .await
        .with_context(|| {
            format!("Detecting if requested GMs exist before associating with {game_id}")
        })
        .map_err(NewAssociationError::PortError)?;
        let existing_gm_id_set: HashSet<i64> = existing_gms
            .into_iter()
            .map(|existing_gm| existing_gm.id)
            .collect();
        for gm_id in game_master_ids {
            if !existing_gm_id_set.contains(gm_id) {
                return Err(NewAssociationError::GameMasterDoesNotExist(*gm_id));
            }
        }

        // Perform the association
        let mut bulk_insert_query: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("INSERT INTO event_game_masters(event_id, gm_id)");
        bulk_insert_query.push_values(game_master_ids, |mut builder, gm_id| {
            builder.push(game_id);
            builder.push(gm_id);
        });

        bulk_insert_query
            .build()
            .execute(db_cxn.borrow_connection())
            .await
            .with_context(|| format!("Performing association of GMs with game {game_id}"))
            .map_err(NewAssociationError::PortError)?;
        Ok(())
    }

    #[tracing::instrument(skip(self, ext_cxn))]
    async fn remove_gms_from_game(
        &self,
        game_id: i64,
        game_master_ids: &[i64],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<(), Error> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .with_context(|| format!("Removing GMs from game {game_id}"))?;

        for gm_id in game_master_ids {
            sqlx::query!("DELETE FROM event_game_masters WHERE event_game_masters.event_id = $1 AND event_game_masters.gm_id = $2", game_id, gm_id)
                .execute(db_cxn.borrow_connection())
                .await
                .with_context(|| format!("Removing GM {gm_id} from game {game_id}"))?;
        }

        Ok(())
    }
}
