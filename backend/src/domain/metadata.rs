#![expect(dead_code)]

use crate::domain::event::IngestEvent;
use crate::domain::unique::driven_ports::UniqueStringSaver;
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;
use std::collections::HashSet;
use crate::domain::unique;
use crate::domain::unique::ConstructUniqueStr;

pub struct EventType {
    pub id: i32,
    pub name: String,
}

impl ConstructUniqueStr<i32> for EventType {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, name: value }
    }
}

pub struct GameSystem {
    pub id: i64,
    pub system_name: String,
}

impl ConstructUniqueStr<i64> for GameSystem {
    fn new_with_id(id: i64, value: String) -> Self {
        Self {
            id,
            system_name: value,
        }
    }
}

#[cfg_attr(test, derive(PartialEq, Eq, Debug))]
pub struct Contact {
    pub id: i64,
    pub email: String,
}

impl ConstructUniqueStr<i64> for Contact {
    fn new_with_id(id: i64, value: String) -> Self {
        Self { id, email: value }
    }
}

pub struct Group {
    pub id: i64,
    pub name: String,
}

impl ConstructUniqueStr<i64> for Group {
    fn new_with_id(id: i64, value: String) -> Self {
        Self { id, name: value }
    }
}

pub struct Website {
    pub id: i64,
    pub url: String,
}

impl ConstructUniqueStr<i64> for Website {
    fn new_with_id(id: i64, value: String) -> Self {
        Self { id, url: value }
    }
}

pub struct Materials {
    pub id: i64,
    pub summary: String,
}

impl ConstructUniqueStr<i64> for Materials {
    fn new_with_id(id: i64, value: String) -> Self {
        Self { id, summary: value }
    }
}

#[derive(Clone, Debug)]
pub struct UniqueMetadataToSave<'incoming_data> {
    event_types: Vec<&'incoming_data str>,
    game_systems: Vec<&'incoming_data str>,
    contacts: Vec<&'incoming_data str>,
    groups: Vec<&'incoming_data str>,
    websites: Vec<&'incoming_data str>,
    materials: Vec<&'incoming_data str>,
}

impl <'ie> From<&'ie [IngestEvent]> for UniqueMetadataToSave<'ie> {
    fn from(events: &'ie[IngestEvent]) -> Self {
        let event_types: HashSet<&str> = events.iter()
            .map(|evt| evt.event_type.as_str())
            .collect();
        let game_systems: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.game_system.as_ref().map(String::as_str))
            .collect();
        let contacts: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.contact.as_ref().map(String::as_str))
            .collect();
        let groups: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.group.as_ref().map(String::as_str))
            .collect();
        let websites: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.website.as_ref().map(String::as_str))
            .collect();
        let materials: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.materials.as_ref().map(String::as_str))
            .collect();
        
        Self {
            event_types: Vec::from_iter(event_types),
            game_systems: Vec::from_iter(game_systems),
            contacts: Vec::from_iter(contacts),
            groups: Vec::from_iter(groups),
            websites: Vec::from_iter(websites),
            materials: Vec::from_iter(materials),
        }
    }
}

pub struct SavedMetadata {
    pub event_types: Vec<EventType>,
    pub game_systems: Vec<GameSystem>,
    pub contacts: Vec<Contact>,
    pub groups: Vec<Group>,
    pub websites: Vec<Website>,
    pub materials: Vec<Materials>,
}

pub struct Metadata {
    pub event_type: EventType,
    pub game_system: Option<GameSystem>,
    pub materials: Option<Materials>,
    pub contact: Option<Contact>,
    pub website: Option<Website>,
    pub group: Option<Group>,
}

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub(super) async fn save_metadata(
    metadata: UniqueMetadataToSave<'_>,
    evt_type_saver: &impl UniqueStringSaver<i32, EventType>,
    gamesys_saver: &impl UniqueStringSaver<i64, GameSystem>,
    contact_saver: &impl UniqueStringSaver<i64, Contact>,
    group_saver: &impl UniqueStringSaver<i64, Group>,
    websites_saver: &impl UniqueStringSaver<i64, Website>,
    materials_saver: &impl UniqueStringSaver<i64, Materials>,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<SavedMetadata, anyhow::Error> {
    let event_types =
        unique::save_or_get_unique_str(metadata.event_types.as_ref(), evt_type_saver, &mut *ext_cxn)
            .await
            .context("saving event types")?;
    let game_systems =
        unique::save_or_get_unique_str(metadata.game_systems.as_ref(), gamesys_saver, &mut *ext_cxn)
            .await
            .context("saving game systems")?;
    let contacts = unique::save_or_get_unique_str(metadata.contacts.as_ref(), contact_saver, &mut *ext_cxn)
        .await
        .context("saving contacts")?;
    let groups = unique::save_or_get_unique_str(metadata.groups.as_ref(), group_saver, &mut *ext_cxn)
        .await
        .context("saving groups")?;
    let websites =
        unique::save_or_get_unique_str(metadata.websites.as_ref(), websites_saver, &mut *ext_cxn)
            .await
            .context("saving websites")?;
    let materials =
        unique::save_or_get_unique_str(metadata.materials.as_ref(), materials_saver, &mut *ext_cxn)
            .await
            .context("saving materials")?;

    Ok(SavedMetadata {
        event_types,
        game_systems,
        contacts,
        groups,
        websites,
        materials,
    })
}
