#![expect(dead_code)]

use crate::domain::game_master::driven_ports::{GMAssociator, NewAssociationError};
use crate::domain::unique::driven_ports::UniqueStringSaver;
use crate::domain::unique::{ConstructUniqueStr, save_or_get_unique_str};
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;
use derive_more::{Display, Error};

#[derive(Clone)]
/// Domain model for a game master (GM) represented as a unique string value.
pub struct GameMaster {
    pub id: i64,
    pub name: String,
}

impl ConstructUniqueStr<i64> for GameMaster {
    fn new_with_id(id: i64, value: String) -> Self {
        Self { id, name: value }
    }
}

#[derive(Debug, Display, Error)]
/// Errors that can occur while creating/removing associations between GMs and events.
pub enum GameMasterAssociationError {
    #[display(
        "When requesting existing associations, only {existing_games} of {requested_games} actually exist"
    )]
    GamesDoNotExist {
        requested_games: usize,
        existing_games: usize,
    },
    #[display("Game with ID {} does not exist", _0)]
    GameDoesNotExist(#[error(not(source))] i64),
    #[display("Game master with ID {} does not exist", _0)]
    GameMasterDoesNotExist(#[error(not(source))] i64),
    Other(anyhow::Error),
}

impl From<driven_ports::ExistingAssociationError> for GameMasterAssociationError {
    fn from(e: driven_ports::ExistingAssociationError) -> Self {
        match e {
            driven_ports::ExistingAssociationError::GamesDoNotExist {
                requested_games,
                existing_games,
            } => Self::GamesDoNotExist {
                requested_games,
                existing_games,
            },
            driven_ports::ExistingAssociationError::PortError(e) => Self::Other(e),
        }
    }
}

impl From<driven_ports::NewAssociationError> for GameMasterAssociationError {
    fn from(value: NewAssociationError) -> Self {
        match value {
            NewAssociationError::GameDoesNotExist(id) => Self::GameDoesNotExist(id),
            NewAssociationError::GameMasterDoesNotExist(id) => Self::GameMasterDoesNotExist(id),
            NewAssociationError::PortError(e) => Self::Other(e),
        }
    }
}

#[derive(Debug)]
/// Input mapping of an event to the list of GM names to be associated.
pub struct GameMastersForEvent {
    pub event_id: i64,
    pub game_masters: Vec<String>,
}

pub mod driven_ports {
    use super::*;
    use crate::domain::BulkLookupResult;

    #[derive(Debug, Display, Error)]
    /// Errors when retrieving existing GM associations for events.
    pub enum ExistingAssociationError {
        #[display(
            "When requesting existing associations, only {existing_games} of {requested_games} actually exist"
        )]
        GamesDoNotExist {
            requested_games: usize,
            existing_games: usize,
        },
        PortError(anyhow::Error),
    }

    #[derive(Debug, Display, Error)]
    /// Errors when creating or validating new GM associations for an event.
    pub enum NewAssociationError {
        #[display("Game with ID {} does not exist", _0)]
        GameDoesNotExist(#[error(not(source))] i64),
        #[display("Game master with ID {} does not exist", _0)]
        GameMasterDoesNotExist(#[error(not(source))] i64),
        PortError(anyhow::Error),
    }

    /// Port for associating game masters with events in the persistence layer.
    pub trait GMAssociator {
        /// Returns existing GM IDs for each requested event (None if event has no GMs).
        async fn existing_gm_associations(
            &self,
            game_ids: &[i64],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<Vec<i64>, ExistingAssociationError>;

        /// Associates the specified GM IDs with the given event, validating existence.
        async fn associate_gms_with_game(
            &self,
            game_id: i64,
            game_master_ids: &[i64],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<(), NewAssociationError>;

        /// Removes the specified GM IDs from the given event.
        async fn remove_gms_from_game(
            &self,
            game_id: i64,
            game_master_ids: &[i64],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<(), anyhow::Error>;
    }
}

#[tracing::instrument(skip_all, fields(total_game_assocs = game_masters.len(), first_5_assocs = ?game_masters.get(0..5)))]
/// Ensures GM names exist and synchronizes GM associations for each event.
pub async fn save_game_masters(
    game_masters: &[GameMastersForEvent],

    gm_save: &impl UniqueStringSaver<i64, GameMaster>,
    gm_assoc: &impl GMAssociator,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<(), GameMasterAssociationError> {
    use std::collections::{HashMap, HashSet};

    // First, gather all unique GM names across all games
    let mut all_gm_names: HashSet<&str> = HashSet::new();

    // Create a mapping from game_id to its game masters for later use
    let mut game_to_gms: HashMap<i64, Vec<&str>> = HashMap::new();

    // List out all event IDs in order
    let event_ids: Vec<i64> = game_masters
        .iter()
        .map(|game_master_for_game| game_master_for_game.event_id)
        .collect();

    // Collect all unique GM names and build the name->id mapping
    for game_master_for_game in game_masters {
        let game_id = game_master_for_game.event_id;
        let gm_names = &game_master_for_game.game_masters;

        // Skip if there are no game masters for this game
        if gm_names.is_empty() {
            continue;
        }

        // Convert Vec<String> to Vec<&str> for save_or_get_unique_str
        let gm_names_refs: Vec<&str> = gm_names.iter().map(|s| s.as_str()).collect();

        // Add to the set of all unique GM names
        for &name in &gm_names_refs {
            all_gm_names.insert(name);
        }

        // Store the mapping from game_id to its game masters
        game_to_gms.insert(game_id, gm_names_refs);
    }

    // If there are no game masters at all, return early
    if all_gm_names.is_empty() {
        return Ok(());
    }

    // Convert the HashSet to a Vec for save_or_get_unique_str
    let all_gm_names_vec: Vec<&str> = all_gm_names.into_iter().collect();

    // Save or get all unique game master names at once
    let saved_gms = save_or_get_unique_str(&all_gm_names_vec, gm_save, ext_cxn)
        .await
        .context("Saving unique GM names before game association")
        .map_err(GameMasterAssociationError::Other)?;

    // Create a mapping from GM name to its ID for quick lookup
    let mut gm_name_to_id: HashMap<&str, i64> = HashMap::new();
    for (i, &name) in all_gm_names_vec.iter().enumerate() {
        gm_name_to_id.insert(name, saved_gms[i].id);
    }

    // Detect all existing game-to-gm relationships
    let existing_gms: Vec<Option<Vec<i64>>> = gm_assoc
        .existing_gm_associations(&event_ids, ext_cxn)
        .await?;

    // Now perform the association for each game and remove GMs that are no longer part of the game
    for (game_id, gm_associations) in event_ids.iter().zip(existing_gms.into_iter()) {
        // Get the IDs for this game's GMs
        let mut seen_gm_ids: HashSet<i64> = HashSet::new();
        let gm_ids: Option<Vec<i64>> = game_to_gms.remove(game_id).map(|name_list| {
            name_list
                .iter()
                .filter_map(|&name| {
                    let gm_id = gm_name_to_id[name];
                    if seen_gm_ids.contains(&gm_id) {
                        return None;
                    }
                    seen_gm_ids.insert(gm_id);
                    Some(gm_id)
                })
                .collect()
        });

        let (new_gm_ids, gm_ids_to_remove) = match (gm_ids, gm_associations) {
            (Some(requested_ids), Some(present_existing_associations)) => {
                let gm_id_set: HashSet<i64> = requested_ids.iter().copied().collect();
                let existing_gm_id_set: HashSet<i64> =
                    present_existing_associations.iter().copied().collect();

                // Filter out GMs that are already associated with the game
                let new: Vec<i64> = requested_ids
                    .iter()
                    .filter_map(|id| {
                        if !existing_gm_id_set.contains(id) {
                            Some(*id)
                        } else {
                            None
                        }
                    })
                    .collect();
                // Determine which GM IDs to remove
                let remove: Vec<i64> = present_existing_associations
                    .iter()
                    .filter_map(|existing_gm_id| {
                        if !gm_id_set.contains(existing_gm_id) {
                            Some(*existing_gm_id)
                        } else {
                            None
                        }
                    })
                    .collect();

                (new, remove)
            }
            (Some(requested_ids), None) => (requested_ids, vec![]),
            (None, Some(present_existing_associations)) => (vec![], present_existing_associations),
            (None, None) => continue,
        };

        // Associate new GMs with the game if there are any
        if !new_gm_ids.is_empty() {
            let assoc_result = gm_assoc
                .associate_gms_with_game(*game_id, &new_gm_ids, ext_cxn)
                .await;
            if assoc_result.is_err() {
                assoc_result?;
            }
        }

        // Remove GMs from the game, if any
        if !gm_ids_to_remove.is_empty() {
            gm_assoc
                .remove_gms_from_game(*game_id, &gm_ids_to_remove, ext_cxn)
                .await
                .with_context(|| {
                    format!("Removing GMs that are no longer part of the game {game_id}")
                })
                .map_err(GameMasterAssociationError::Other)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    mod save_game_masters {
        use super::*;
        use crate::domain::game_master::test_util::FakeGmAssociator;
        use crate::domain::test_util::Connectivity;
        use crate::domain::unique::test_util::FakeStringSaver;
        use crate::external_connections::test_util::FakeExternalConnectivity;
        use speculoos::prelude::*;
        use std::collections::{HashMap, HashSet};
        use std::sync::Mutex;

        #[tokio::test]
        async fn correctly_adjusts_saved_gms() {
            let mut fake_cxn = FakeExternalConnectivity::new();
            let gm_assoc = FakeGmAssociator::build_locked(|assoc| {
                assoc.valid_games = HashSet::from([1, 2, 3]);
                assoc.valid_gms = HashSet::from([4, 5, 6]);
                assoc.existing_gms = HashMap::from([(1, vec![5]), (2, vec![4, 5, 6])]);
            });
            let expected_final_gms =
                HashMap::from([(1, vec![4]), (2, vec![4, 5]), (3, vec![6, 5])]);
            let gm_save: Mutex<FakeStringSaver<i64>> = FakeStringSaver::new_locked(|save| {
                save.saved_strings = vec![(4, "John Doe".to_owned()), (5, "John Smith".to_owned())];
            });
            let expected_final_saved_gms = [
                (4, "John Doe".to_owned()),
                (5, "John Smith".to_owned()),
                (6, "Jane Doe".to_owned()),
            ];
            let gms_to_save = [
                GameMastersForEvent {
                    event_id: 1,
                    game_masters: vec!["John Doe".to_owned()],
                },
                GameMastersForEvent {
                    event_id: 2,
                    game_masters: vec!["John Doe".to_owned(), "John Smith".to_owned()],
                },
                GameMastersForEvent {
                    event_id: 3,
                    game_masters: vec!["Jane Doe".to_owned(), "John Smith".to_owned()],
                },
            ];

            let save_result =
                save_game_masters(&gms_to_save, &gm_save, &gm_assoc, &mut fake_cxn).await;

            let gm_assoc_locked = gm_assoc.lock().expect("Could not lock FakeGmAssociator");
            let gm_save_locked = gm_save.lock().expect("Could not lock FakeStringSaver");

            assert_that!(save_result).is_ok();
            assert_eq!(expected_final_gms, gm_assoc_locked.existing_gms);
            assert_eq!(
                expected_final_saved_gms,
                gm_save_locked.saved_strings.as_slice()
            );
        }

        #[tokio::test]
        async fn fails_when_gm_saving_blows_up() {
            let mut fake_cxn = FakeExternalConnectivity::new();
            let gm_assoc = FakeGmAssociator::build_locked(|assoc| {
                assoc.valid_games = HashSet::from([1, 2, 3]);
                assoc.valid_gms = HashSet::from([4, 5, 6]);
            });
            let gm_save: Mutex<FakeStringSaver<i64>> = FakeStringSaver::new_locked(|saver| {
                saver.connectivity = Connectivity::Disconnected;
            });
            let gms_to_save = [GameMastersForEvent {
                event_id: 1,
                game_masters: vec!["John Doe".to_owned()],
            }];

            let save_result =
                save_game_masters(&gms_to_save, &gm_save, &gm_assoc, &mut fake_cxn).await;

            assert_that!(save_result).is_err();
        }

        #[tokio::test]
        async fn fails_when_game_does_not_exist() {
            let mut fake_cxn = FakeExternalConnectivity::new();
            let gm_assoc = FakeGmAssociator::build_locked(|assoc| {
                assoc.valid_games = HashSet::from([1]);
                assoc.valid_gms = HashSet::from([4]);
            });
            let gm_save: Mutex<FakeStringSaver<i64>> = FakeStringSaver::new_locked(|saver| {
                saver.saved_strings = vec![(4, "John Doe".to_owned())];
            });
            let gms_to_save = [GameMastersForEvent {
                event_id: 4,
                game_masters: vec!["John Doe".to_owned()],
            }];

            let save_result =
                save_game_masters(&gms_to_save, &gm_save, &gm_assoc, &mut fake_cxn).await;

            assert_that!(save_result).matches(|err| {
                matches!(
                    err,
                    Err(GameMasterAssociationError::GamesDoNotExist {
                        existing_games: 0,
                        requested_games: 1
                    })
                )
            });
        }

        #[tokio::test]
        async fn fails_when_game_master_does_not_exist() {
            let mut fake_cxn = FakeExternalConnectivity::new();
            let gm_assoc = FakeGmAssociator::build_locked(|assoc| {
                assoc.valid_games = HashSet::from([1]);
                assoc.valid_gms = HashSet::from([4]);
            });
            let gm_save: Mutex<FakeStringSaver<i64>> = FakeStringSaver::new_locked(|saver| {
                saver.saved_strings = vec![(4, "John Doe".to_owned())];
            });
            let gms_to_save = [GameMastersForEvent {
                event_id: 1,
                game_masters: vec!["John Doe".to_owned(), "John Smith".to_owned()],
            }];

            let save_result =
                save_game_masters(&gms_to_save, &gm_save, &gm_assoc, &mut fake_cxn).await;

            assert_that!(save_result).matches(|err| {
                matches!(
                    err,
                    Err(GameMasterAssociationError::GameMasterDoesNotExist(5))
                )
            });
        }
    }
}

#[cfg(test)]
pub mod test_util {
    use super::*;
    use crate::domain::BulkLookupResult;
    use crate::domain::game_master::driven_ports::ExistingAssociationError;
    use crate::domain::test_util::Connectivity;
    use anyhow::Error;
    use std::collections::{HashMap, HashSet};
    use std::sync::Mutex;

    /// In-memory fake GMAssociator for tests with configurable validity and existing associations.
    pub struct FakeGmAssociator {
        pub existing_gms: HashMap<i64, Vec<i64>>,
        pub valid_games: HashSet<i64>,
        pub valid_gms: HashSet<i64>,
        pub connectivity: Connectivity,
    }

    impl FakeGmAssociator {
        /// Creates a default FakeGmAssociator with no data and connected state.
        fn new() -> Self {
            Self {
                existing_gms: HashMap::new(),
                valid_games: HashSet::new(),
                valid_gms: HashSet::new(),
                connectivity: Connectivity::Connected,
            }
        }

        /// Builds and returns a Mutex-wrapped FakeGmAssociator after applying the provided builder.
        pub fn build_locked(
            builder: impl FnOnce(&mut FakeGmAssociator),
        ) -> Mutex<FakeGmAssociator> {
            let mut new_associator = Self::new();
            builder(&mut new_associator);
            Mutex::new(new_associator)
        }
    }

    impl GMAssociator for Mutex<FakeGmAssociator> {
        async fn existing_gm_associations(
            &self,
            game_ids: &[i64],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<Vec<i64>, ExistingAssociationError> {
            let self_lock = self.lock().expect("Could not lock FakeGmAssociator");
            self_lock
                .connectivity
                .blow_up_if_disconnected()
                .map_err(ExistingAssociationError::PortError)?;

            if !game_ids.iter().all(|id| self_lock.valid_games.contains(id)) {
                return Err(ExistingAssociationError::GamesDoNotExist {
                    existing_games: 0,
                    requested_games: game_ids.len(),
                });
            }
            let mut gm_ids: Vec<Option<Vec<i64>>> = Vec::with_capacity(game_ids.len());
            for game_id in game_ids.iter() {
                let gms_for_game = self_lock.existing_gms.get(game_id).cloned();
                gm_ids.push(gms_for_game);
            }

            Ok(gm_ids)
        }

        async fn associate_gms_with_game(
            &self,
            game_id: i64,
            game_master_ids: &[i64],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<(), NewAssociationError> {
            let mut self_lock = self.lock().expect("Could not lock FakeGmAssociator");
            self_lock
                .connectivity
                .blow_up_if_disconnected()
                .map_err(NewAssociationError::PortError)?;

            if !self_lock.valid_games.contains(&game_id) {
                return Err(NewAssociationError::GameDoesNotExist(game_id));
            }

            for id in game_master_ids {
                if !self_lock.valid_gms.contains(id) {
                    return Err(NewAssociationError::GameMasterDoesNotExist(*id));
                }
            }

            let gms_for_game = self_lock.existing_gms.entry(game_id).or_default();
            for id in game_master_ids {
                if !gms_for_game.contains(id) {
                    gms_for_game.push(*id);
                }
            }

            Ok(())
        }

        async fn remove_gms_from_game(
            &self,
            game_id: i64,
            game_master_ids: &[i64],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<(), anyhow::Error> {
            let mut self_lock = self.lock().expect("Could not lock FakeGmAssociator");
            self_lock.connectivity.blow_up_if_disconnected()?;

            self_lock
                .existing_gms
                .get_mut(&game_id)
                .ok_or_else(|| Error::msg("Game does not exist"))?
                .retain(|id| !game_master_ids.contains(id));
            Ok(())
        }
    }
}
