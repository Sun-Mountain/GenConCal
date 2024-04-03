use crate::domain::event::FullEvent;

pub struct Tournament {
    id: i32,
    name: String,
    total_rounds: u8,
}

pub struct TournamentSegment {
    round: u8,
    segment_events: Vec<FullEvent>,
}