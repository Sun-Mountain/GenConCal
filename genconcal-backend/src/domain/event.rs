use chrono::{DateTime, Utc};
use crate::domain::location::Location;
use crate::domain::metadata::{Contact, Group, Materials, Website};

pub struct FullEvent {
    id: i32,
    game_id: String,
    
    game_system: GameSystem,
    event_type: EventType,
    title: String,
    description: String,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
    cost: Option<u16>,

    tickets_available: u16,
    min_players: u16,
    max_players: u16,
    
    age_requirement: AgeRequirement,
    experience_requirement: ExperienceLevel,
    
    location: Option<Location>,
    table_number: u16,
    
    materials: Option<Materials>,
    contact: Option<Contact>,
    website: Option<Website>,
    group: Option<Group>,
}

#[derive(PartialEq, Eq, Ord, PartialOrd)]
pub enum AgeRequirement {
    KidsOnly,
    Everyone,
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

#[derive(PartialEq, Eq, Ord, PartialOrd)]
pub enum ExperienceLevel {
    None,
    Some,
    Expert,
}
