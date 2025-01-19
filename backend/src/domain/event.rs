#![expect(dead_code)]
use chrono::DateTime;
use chrono_tz::Tz;
#[cfg(test)]
use serde::Serialize;

use crate::domain::location::{Location, LocationIngest};
use crate::domain::metadata;
use crate::domain::metadata::{Contact, Group, Materials, Metadata, Website};
use crate::domain::tournament::RoundInfoIngest;

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


}
