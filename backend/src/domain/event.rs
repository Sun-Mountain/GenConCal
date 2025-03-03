#![expect(dead_code)]
use chrono::DateTime;
use chrono_tz::Tz;
#[cfg(test)]
use serde::Serialize;

use crate::domain::location::{Location, LocationIngest};
use crate::domain::{location, metadata};
use crate::domain::metadata::{Metadata, UniqueMetadataToSave};
use crate::domain::tournament::RoundInfoIngest;
use crate::external_connections::ExternalConnectivity;

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
    pub cost: Option<u16>,

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

#[derive(PartialEq, Eq, Ord, PartialOrd, Debug)]
pub enum AgeRequirement {
    Everyone,
    KidsOnly,
    Teen,
    Mature,
    Adult,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Debug)]
pub enum ExperienceLevel {
    None,
    Some,
    Expert,
}

pub struct CreateParams<'items> {
    pub game_id: &'items str,
    pub game_system_id: i32,
    pub event_type_id: i32,
    pub title: &'items str,
    pub description: &'items str,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u16>,
    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,
    pub age_requirement: AgeRequirement,
    pub experience_level: ExperienceLevel,
    pub location: super::location::Ref,
    pub table_number: Option<u16>,
    pub materials: Option<i32>,
    pub contact: Option<i32>,
    pub website: Option<i32>,
    pub group: Option<i32>,
}

pub struct UpdateParams<'items> {
    pub game_system_id: i32,
    pub event_type_id: i32,
    pub title: &'items str,
    pub description: &'items str,
    pub start: DateTime<Tz>,
    pub end: DateTime<Tz>,
    pub cost: Option<u16>,
    pub tickets_available: u16,
    pub min_players: u16,
    pub max_players: u16,
    pub age_requirement: AgeRequirement,
    pub experience_requirement: ExperienceLevel,
    pub location: Option<super::location::Ref>,
    pub table_number: Option<u16>,
    pub materials: Option<i32>,
    pub contact: Option<i32>,
    pub website: Option<i32>,
    pub group: Option<i32>,
}

pub mod driven_ports {
    use super::*;
    
    pub trait EventDetector {
        async fn event_id_exists(&self, gencon_event_id: &str) -> Result<bool, anyhow::Error>;
    }
    
    pub trait EventWriter {
        async fn bulk_save_events(&self, create_params: &[CreateParams<'_>]) -> Result<Vec<i32>, anyhow::Error>;
        async fn bulk_update_events(&self, update_params: &[(i32, UpdateParams<'_>)]) -> Result<(), anyhow::Error>;
    }
}

pub struct EventService;

impl EventService {
    
    #[allow(clippy::too_many_arguments)]
    async fn import_events(
        &self,
        events_to_import: &[IngestEvent],
        
        evt_type_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::EventType>,
        gamesys_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::GameSystem>,
        contact_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::Contact>,
        group_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::Group>,
        websites_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::Website>,
        materials_saver: &impl metadata::driven_ports::UniqueStringSaver<i32, metadata::Materials>,
        location_reader: &impl location::driven_ports::LocationReader,
        location_writer: &impl location::driven_ports::LocationWriter,
        event_detector: &impl driven_ports::EventDetector,
        event_writer: &impl driven_ports::EventWriter,
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, anyhow::Error> {
        let unique_metadata = UniqueMetadataToSave::from(events_to_import);
        metadata::save_metadata()
    }
}
