use crate::domain::game_master::GameMaster;
use crate::domain::game_master::driven_ports::{
    ExistingAssociationError, GMAssociator, NewAssociationError,
};
use crate::domain::unique::driven_ports::UniqueStringSaver;
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{Context, Error};
use sqlx::{Postgres, Row};
use std::collections::{HashMap, HashSet};
use crate::domain::BulkLookupResult;

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
    gm_ids: Vec<i64>,
}

impl GMAssociator for GameMasterDbAssociator {
    #[tracing::instrument(skip_all, fields(first_5_ids = ?game_ids[0..5], total_ids = game_ids.len()))]
    async fn existing_gm_associations(
        &self,
        game_ids: &[i64],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> BulkLookupResult<Vec<i64>, ExistingAssociationError> {
        let mut db_cxn = ext_cxn
            .database_cxn()
            .await
            .context("Retrieving DB connection to read GMs")
            .map_err(ExistingAssociationError::PortError)?;

        let matching_games_count = sqlx::query!(
            "SELECT count(id) FROM events WHERE events.id = ANY($1)",
            game_ids
        )
        .fetch_one(db_cxn.borrow_connection())
        .await
        .context("Detecting if all events exist before GM retrieval")
        .map_err(ExistingAssociationError::PortError)?;
        if let Some(existing_games) = matching_games_count.count {
            if existing_games as usize != game_ids.len() {
                return Err(ExistingAssociationError::GamesDoNotExist {
                    existing_games: existing_games as usize,
                    requested_games: game_ids.len(),
                });
            }
        };

        let game_ids_to_idx: HashMap<i64, usize> = game_ids.iter().enumerate().map(|(idx, id)| (*id, idx)).collect();
        let mut associated_gms: Vec<Option<Vec<i64>>> = vec![None; game_ids.len()];


        let associated_gm_dtos = sqlx::query_as!(
            EventIdDTO,
            "SELECT event_id, array_agg(gm_id) as \"gm_ids!\" FROM event_game_masters WHERE event_id = ANY($1) GROUP BY event_id",
            game_ids
        )
        .fetch_all(db_cxn.borrow_connection())
        .await
        .context("Retrieving GMs for requested games")
        .map_err(ExistingAssociationError::PortError)?;

        for event_gms in associated_gm_dtos.into_iter() {
            let result_idx = game_ids_to_idx[&event_gms.event_id];
            associated_gms[result_idx] = Some(event_gms.gm_ids);
        }

        Ok(associated_gms)
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
