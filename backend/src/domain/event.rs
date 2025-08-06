#![expect(dead_code)]

use crate::domain::game_master::driven_ports::GMAssociator;
use crate::domain::location::driven_ports::{LocationReader, LocationWriter};
use crate::domain::location::{Location, LocationIngest, Room, Section};
use crate::domain::metadata::{Metadata, UniqueMetadataToSave};
use crate::domain::tournament::RoundInfoIngest;
use crate::domain::unique::driven_ports::UniqueStringSaver;
use crate::domain::{game_master, location, metadata};
use crate::external_connections::ExternalConnectivity;
use anyhow::{Context, anyhow};
use chrono::{DateTime, Datelike};
use chrono_tz::Tz;
#[cfg(test)]
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use tracing::debug_span;

pub struct FullEvent {
    pub event: Event,
    pub location: Option<Location>,
    pub metadata: Metadata,
}

pub struct Event {
    pub id: i32,
    pub game_id: String,

    pub title: String,
    pub description: String,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u16>,

    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,

    pub age_requirement: AgeRequirement,
    pub experience_requirement: ExperienceLevel,
    pub table_number: Option<u16>,
}

#[derive(Debug)]
pub struct IngestEvent {
    pub game_id: String,

    pub game_system: Option<String>,
    pub event_type: String,
    pub title: String,
    pub description: String,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u32>,

    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,

    pub age_requirement: AgeRequirement,
    pub experience_requirement: ExperienceLevel,

    pub location: Option<LocationIngest>,
    pub table_number: Option<u16>,

    pub materials: Option<String>,
    pub contact: Option<String>,
    pub website: Option<String>,
    pub group: Option<String>,

    pub tournament: Option<RoundInfoIngest>,
    pub game_masters: Vec<String>,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Debug, Clone, Copy)]
pub enum AgeRequirement {
    Everyone,
    KidsOnly,
    Teen,
    Mature,
    Adult,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Debug, Clone, Copy)]
pub enum ExperienceLevel {
    None,
    Some,
    Expert,
}

#[derive(Debug)]
pub struct CreateParams<'items> {
    pub game_id: &'items str,
    pub event_type_id: i32,
    pub game_system_id: Option<i64>,
    pub title: &'items str,
    pub description: &'items str,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u32>,
    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,
    pub age_requirement: AgeRequirement,
    pub experience_level: ExperienceLevel,
    pub location: Option<location::Ref>,
    pub table_number: Option<u16>,
    pub materials: Option<i64>,
    pub contact: Option<i64>,
    pub website: Option<i64>,
    pub group: Option<i64>,
}

#[derive(Debug)]
pub struct UpdateParams<'items> {
    pub event_type_id: i32,
    pub game_system_id: Option<i64>,
    pub title: &'items str,
    pub description: &'items str,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u32>,
    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,
    pub age_requirement: AgeRequirement,
    pub experience_requirement: ExperienceLevel,
    pub location: Option<location::Ref>,
    pub table_number: Option<u16>,
    pub materials: Option<i64>,
    pub contact: Option<i64>,
    pub website: Option<i64>,
    pub group: Option<i64>,
}

pub mod driven_ports {
    use super::*;

    pub trait EventDetector {
        async fn bulk_event_id_exists(
            &self,
            gencon_event_id: &[&str],
            current_year: i32,
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<i64>>, anyhow::Error>;
    }

    pub trait EventWriter {
        async fn bulk_save_events(
            &self,
            create_params: &[CreateParams<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i64>, anyhow::Error>;
        async fn bulk_update_events(
            &self,
            update_params: &[(i64, UpdateParams<'_>)],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<(), anyhow::Error>;
    }
}

pub mod driving_ports {
    use super::*;
    use crate::domain::game_master;
    use crate::domain::game_master::driven_ports::GMAssociator;

    pub trait EventPort: Sync {
        #[allow(clippy::too_many_arguments)]
        async fn import_events(
            &self,
            events_to_import: &[IngestEvent],

            evt_type_saver: &impl UniqueStringSaver<i32, metadata::EventType>,
            gamesys_saver: &impl UniqueStringSaver<i64, metadata::GameSystem>,
            contact_saver: &impl UniqueStringSaver<i64, metadata::Contact>,
            group_saver: &impl UniqueStringSaver<i64, metadata::Group>,
            websites_saver: &impl UniqueStringSaver<i64, metadata::Website>,
            materials_saver: &impl UniqueStringSaver<i64, metadata::Materials>,
            gm_saver: &impl UniqueStringSaver<i64, game_master::GameMaster>,
            location_reader: &impl LocationReader,
            location_writer: &impl LocationWriter,
            gm_assoc: &impl GMAssociator,
            event_detector: &impl driven_ports::EventDetector,
            event_writer: &impl driven_ports::EventWriter,
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i64>, anyhow::Error>;
    }
}

pub struct EventService;

impl driving_ports::EventPort for EventService {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument(skip_all, fields(event_titles=events_to_import.iter().take(50).map(|event| event.title.as_str()).collect::<Vec<_>>().join(",\n")))]
    async fn import_events(
        &self,
        events_to_import: &[IngestEvent],

        evt_type_saver: &impl UniqueStringSaver<i32, metadata::EventType>,
        gamesys_saver: &impl UniqueStringSaver<i64, metadata::GameSystem>,
        contact_saver: &impl UniqueStringSaver<i64, metadata::Contact>,
        group_saver: &impl UniqueStringSaver<i64, metadata::Group>,
        websites_saver: &impl UniqueStringSaver<i64, metadata::Website>,
        materials_saver: &impl UniqueStringSaver<i64, metadata::Materials>,
        gm_saver: &impl UniqueStringSaver<i64, game_master::GameMaster>,
        location_reader: &impl LocationReader,
        location_writer: &impl LocationWriter,
        gm_assoc: &impl GMAssociator,
        event_detector: &impl driven_ports::EventDetector,
        event_writer: &impl driven_ports::EventWriter,
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i64>, anyhow::Error> {
        if events_to_import.is_empty() {
            return Ok(Vec::new());
        }

        let unique_metadata = UniqueMetadataToSave::from(events_to_import);
        let saved_metadata = metadata::save_metadata(
            unique_metadata,
            evt_type_saver,
            gamesys_saver,
            contact_saver,
            group_saver,
            websites_saver,
            materials_saver,
            &mut *ext_cxn,
        )
        .await
        .context("Saving metadata for incoming events")?;

        let type_ids_by_name: HashMap<&str, i32> = saved_metadata
            .event_types
            .iter()
            .map(|evt_type| (evt_type.name.as_str(), evt_type.id))
            .collect();
        let game_system_ids_by_name: HashMap<&str, i64> = saved_metadata
            .game_systems
            .iter()
            .map(|system| (system.system_name.as_str(), system.id))
            .collect();
        let contact_ids_by_name: HashMap<&str, i64> = saved_metadata
            .contacts
            .iter()
            .map(|contact| (contact.email.as_str(), contact.id))
            .collect();
        let group_ids_by_name: HashMap<&str, i64> = saved_metadata
            .groups
            .iter()
            .map(|group| (group.name.as_str(), group.id))
            .collect();
        let website_ids_by_name: HashMap<&str, i64> = saved_metadata
            .websites
            .iter()
            .map(|website| (website.url.as_str(), website.id))
            .collect();
        let materials_ids_by_name: HashMap<&str, i64> = saved_metadata
            .materials
            .iter()
            .map(|materials| (materials.summary.as_str(), materials.id))
            .collect();

        let mut seen_locations: HashSet<&LocationIngest> = HashSet::new();
        let unique_locations_to_import: Vec<LocationIngest> = events_to_import
            .iter()
            .filter_map(|event| {
                if let Some(ref location) = event.location {
                    if !seen_locations.contains(location) {
                        seen_locations.insert(location);
                        return Some(location.clone());
                    }
                }

                None
            })
            .collect();

        let saved_unique_locations = location::save_locations(
            &unique_locations_to_import,
            location_reader,
            location_writer,
            &mut *ext_cxn,
        )
        .await
        .context("Saving location for incoming events")?;
        let location_ingest_to_ref: HashMap<LocationIngest, location::Ref> =
            incoming_locations_to_refs(saved_unique_locations);
        let event_ids: Vec<&str> = events_to_import
            .iter()
            .map(|event| event.game_id.as_str())
            .collect();
        let event_existence = event_detector
            .bulk_event_id_exists(&event_ids, events_to_import[0].start.year(), &mut *ext_cxn)
            .await
            .context("Detecting event presence before insert")?;

        let mut event_creates: Vec<CreateParams<'_>> = Vec::new();
        let mut event_updates: Vec<(i64, UpdateParams<'_>)> = Vec::new();

        {
            let evt_assembly = debug_span!("event_assembly");
            let _enter = evt_assembly.enter();

            for (found_event_id, event_ingest) in
                event_existence.iter().cloned().zip(events_to_import.iter())
            {
                let Some(&event_type_id) = type_ids_by_name.get(event_ingest.event_type.as_str())
                else {
                    return Err(anyhow!(
                        "Unexpected error: did not receive ID for event type {} during ingest",
                        event_ingest.event_type
                    ));
                };
                let game_system_id = find_id_for_optional_str(
                    event_ingest.game_system.as_deref(),
                    &game_system_ids_by_name,
                    "game system",
                )?;
                let contact_id = find_id_for_optional_str(
                    event_ingest.contact.as_deref(),
                    &contact_ids_by_name,
                    "contact email",
                )?;
                let group_id = find_id_for_optional_str(
                    event_ingest.group.as_deref(),
                    &group_ids_by_name,
                    "group",
                )?;
                let website_id = find_id_for_optional_str(
                    event_ingest.website.as_deref(),
                    &website_ids_by_name,
                    "website url",
                )?;
                let materials_id = find_id_for_optional_str(
                    event_ingest.materials.as_deref(),
                    &materials_ids_by_name,
                    "materials list",
                )?;
                let location_ref = if let Some(ref event_location) = event_ingest.location {
                    let Some(fetched_location) = location_ingest_to_ref.get(event_location) else {
                        return Err(anyhow!(
                            "Unexpected error: previously saved location {:?} but failed to retrieve its ID",
                            event_location
                        ));
                    };
                    Some((*fetched_location).clone())
                } else {
                    None
                };

                if let Some(id) = found_event_id {
                    let event_update_data = UpdateParams {
                        event_type_id,
                        game_system_id,
                        title: event_ingest.title.as_str(),
                        description: event_ingest.description.as_str(),
                        start: event_ingest.start,
                        end: event_ingest.end,
                        cost: event_ingest.cost,
                        tickets_available: event_ingest.tickets_available,
                        min_players: event_ingest.min_players,
                        max_players: event_ingest.max_players,
                        age_requirement: event_ingest.age_requirement,
                        experience_requirement: event_ingest.experience_requirement,
                        location: location_ref,
                        table_number: event_ingest.table_number,
                        materials: materials_id,
                        contact: contact_id,
                        website: website_id,
                        group: group_id,
                    };
                    event_updates.push((id, event_update_data));
                } else {
                    let event_create_data = CreateParams {
                        game_id: event_ingest.game_id.as_str(),
                        event_type_id,
                        game_system_id,
                        title: event_ingest.title.as_str(),
                        description: event_ingest.description.as_str(),
                        start: event_ingest.start,
                        end: event_ingest.end,
                        cost: event_ingest.cost,
                        tickets_available: event_ingest.tickets_available,
                        min_players: event_ingest.min_players,
                        max_players: event_ingest.max_players,
                        age_requirement: event_ingest.age_requirement,
                        experience_level: event_ingest.experience_requirement,
                        location: location_ref,
                        table_number: event_ingest.table_number,
                        materials: materials_id,
                        contact: contact_id,
                        website: website_id,
                        group: group_id,
                    };
                    event_creates.push(event_create_data);
                }
            }
        }

        let created_ids = event_writer
            .bulk_save_events(&event_creates, &mut *ext_cxn)
            .await
            .context("Creating events")?;
        event_writer
            .bulk_update_events(&event_updates, &mut *ext_cxn)
            .await
            .context("Updating events")?;

        let mut all_event_ids: Vec<i64> = Vec::new();
        let mut create_idx = 0;

        for existing_event_id in event_existence.iter().cloned() {
            match existing_event_id {
                None => {
                    all_event_ids.push(created_ids[create_idx]);
                    create_idx += 1;
                }
                Some(existing_event_id) => all_event_ids.push(existing_event_id),
            }
        }

        let gm_associations: Vec<game_master::GameMastersForEvent> = all_event_ids
            .iter()
            .cloned()
            .zip(events_to_import.iter())
            .map(|(event_id, event_data)| game_master::GameMastersForEvent {
                event_id,
                game_masters: event_data.game_masters.clone(),
            })
            .collect();

        game_master::save_game_masters(&gm_associations, gm_saver, gm_assoc, ext_cxn)
            .await
            .context("Saving game masters")?;

        Ok(all_event_ids)
    }
}

fn incoming_locations_to_refs(
    saved_unique_locations: Vec<Location>,
) -> HashMap<LocationIngest, location::Ref> {
    saved_unique_locations
        .into_iter()
        .map(|loc| {
            let location_ref = loc.as_location_ref();
            let location_ingest = match loc {
                Location {
                    name: location_name,
                    room:
                        Some(Room {
                            name: room_name,
                            section:
                                Some(Section {
                                    name: section_name, ..
                                }),
                            ..
                        }),
                    ..
                } => LocationIngest::Section {
                    location_name,
                    room_name,
                    section_name,
                },

                Location {
                    name: location_name,
                    room:
                        Some(Room {
                            name: room_name,
                            section: None,
                            ..
                        }),
                    ..
                } => LocationIngest::Room {
                    location_name,
                    room_name,
                },

                Location {
                    name, room: None, ..
                } => LocationIngest::Location { name },
            };

            (location_ingest, location_ref)
        })
        .collect()
}

fn find_id_for_optional_str<T: Copy>(
    maybe_name: Option<&str>,
    name_to_id: &HashMap<&str, T>,
    resource_name: &str,
) -> Result<Option<T>, anyhow::Error> {
    if let Some(name) = maybe_name {
        let Some(&associated_id) = name_to_id.get(name) else {
            return Err(anyhow!(
                "Unexpected error: {resource_name} to ID map did not contain {name}"
            ));
        };

        Ok(Some(associated_id))
    } else {
        Ok(None)
    }
}
