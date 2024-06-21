use chrono::DateTime;
use chrono_tz::Tz;




use crate::domain::location::{Location, LocationIngest};
use crate::domain::metadata::{Contact, Group, Materials, Website};
use crate::domain::tournament::RoundInfoIngest;

pub struct FullEvent {
    pub id: i32,
    pub game_id: String,

    pub game_system: Option<GameSystem>,
    pub event_type: EventType,
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

    pub location: Option<Location>,
    pub table_number: Option<u16>,

    pub materials: Option<Materials>,
    pub contact: Option<Contact>,
    pub website: Option<Website>,
    pub group: Option<Group>,
}

#[derive(Debug)]
#[cfg_attr(test, derive(Serialize))]
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
#[cfg_attr(test, derive(Serialize))]
pub enum AgeRequirement {
    Everyone,
    KidsOnly,
    Teen,
    Mature,
    Adult,
}

pub struct GameSystem {
    pub id: i32,
    pub name: String,
}

pub struct EventType {
    pub id: i32,
    pub name: String,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Debug)]
#[cfg_attr(test, derive(Serialize))]
pub enum ExperienceLevel {
    None,
    Some,
    Expert,
}

pub struct Identifier {
    pub id: i32,
    pub game_id: String,
}

pub enum LocationRef {}
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

pub mod driven_ports {
    use super::*;
    use crate::external_connections::ExternalConnectivity;

    pub trait TypeReader: Sync {
        async fn all(
            &self,
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<EventType>, anyhow::Error>;
    }

    pub trait TypeWriter: Sync {
        async fn bulk_save(
            &self,
            new_types: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;
    }

    pub trait SystemReader: Sync {
        async fn all(
            &self,
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<GameSystem>, anyhow::Error>;
    }

    pub trait SystemWriter: Sync {
        async fn bulk_save(
            &self,
            new_systems: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;
    }

    pub trait Reader: Sync {
        async fn existing_events(
            &self,
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Identifier>, anyhow::Error>;
    }
}
