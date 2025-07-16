use std::collections::HashMap;
use std::fmt::Debug;
use std::str::FromStr;

use chrono::{Duration, NaiveDate, NaiveDateTime, NaiveTime, ParseError, TimeZone};
use chrono_tz::Tz;
use derive_more::{Display, Error};
use fake::faker::boolean::en::Boolean;
use fake::faker::internet::en::SafeEmail;
use fake::faker::lorem::en::*;
use fake::faker::name::en::*;
use fake::{Dummy, Fake, Faker, Opt, Optional};
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::openapi::{RefOr, Schema};
use utoipa::{openapi, OpenApi, ToSchema};
use validator::ValidationErrors;

use crate::domain;
use crate::domain::event::{AgeRequirement, ExperienceLevel};
use crate::dto::IngestEventConvertErr::{UnrecognizedAgeRequirement, UnrecognizedExperience};

#[derive(OpenApi)]
#[openapi(components(
    schemas(
        EventImportRequest,
        ImportedEvent,
        NumberOrString,
        DaysResponse,
        EventDay,
        TimeInfoResponse,
        TimeBlockedEventsResponse,
        PaginationInfo,
        EventBlock,
        EventSummary,
        TicketAvailability,
        DateDto,
        TimeDto,
        BasicError,
        ExtraInfo,
        ValidationErrorSchema,
        CommaSeparated<u16>,
        CommaSeparated<i32>,
        CommaSeparated<String>,
        EventType,
        EventDetailResponse,
        GameSystem,
        Location,
        GameMaster,
        Group,
        TournamentInfo,
        LocationPart,
        TournamentSegment,
        RelatedEvent,
    ),
    responses(
        err_resps::BasicError400Validation,
        err_resps::BasicError404,
        err_resps::BasicError500,
    ),
))]
/// Captures OpenAPI schemas and canned responses defined in the DTO module
pub struct OpenApiSchemas;

#[derive(Debug, Display, Error)]
#[display("Failed to parse comma separated value: {_0}")]
pub struct CommaSepParseErr(#[error(ignore)] String);

#[derive(Clone, Debug, Deserialize, Serialize, ToSchema)]
#[serde(try_from = "String", into = "String")]
#[schema(value_type = String)]
pub struct CommaSeparated<T: FromStr + Debug + Display + Clone>(pub Vec<T>);

impl<T: FromStr + Debug + Display + Clone> TryFrom<String> for CommaSeparated<T> {
    type Error = CommaSepParseErr;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        let comma_sep_val: Vec<T> = value
            .split(',')
            .map(&str::trim)
            .map(|trimmed_str| {
                trimmed_str
                    .parse()
                    .map_err(|_| CommaSepParseErr(trimmed_str.to_owned()))
            })
            .collect::<Result<Vec<T>, CommaSepParseErr>>()?;
        Ok(Self(comma_sep_val))
    }
}

impl<T: FromStr + Display + Debug + Clone> From<CommaSeparated<T>> for String {
    fn from(value: CommaSeparated<T>) -> Self {
        value
            .0
            .iter()
            .map(T::to_string)
            .collect::<Vec<String>>()
            .join(",")
    }
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DaysResponse {
    pub days: Vec<EventDay>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EventDay {
    #[schema(example = 20240708)]
    pub day_id: u32,
    #[schema(example = "7/8/2024")]
    pub date: DateDto,
    #[schema(example = 1000)]
    pub total_events: u16,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TimeInfoResponse {
    #[schema(example = "10:00")]
    pub earliest_time: TimeDto,
    #[schema(example = "23:00")]
    pub latest_time: TimeDto,
}

#[derive(Clone, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DailyTimeBlockedEventsResponse {
    pub events_by_day: HashMap<u32, Vec<EventBlock>>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TimeBlockedEventsResponse {
    pub pagination_info: PaginationInfo,
    pub events_by_time: Vec<EventBlock>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PaginationInfo {
    #[schema(example = 1)]
    pub page: u16,
    #[schema(example = 15)]
    pub total_pages: u16,
}

#[derive(Clone, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EventBlock {
    #[schema(example = "10:00")]
    pub represented_time: TimeDto,
    pub events: Vec<EventSummary>,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EventSummary {
    pub id: u32,
    pub event_time: TimeDto,
    pub title: String,
    pub tickets: TicketAvailability,
    pub duration: f32,
    pub cost: Option<u16>,
}

pub struct EventInTimeSlot(u32);

pub fn event_in_time_slot(time: u32) -> EventInTimeSlot {
    EventInTimeSlot(time)
}

impl Dummy<EventInTimeSlot> for EventSummary {
    fn dummy_with_rng<R: Rng + ?Sized>(config: &EventInTimeSlot, rng: &mut R) -> Self {
        let id: u32 = (100..10_000).fake_with_rng(rng);
        let event_time =
            TimeDto(NaiveTime::from_hms_opt(config.0, (0..60).fake_with_rng(rng), 0).unwrap());
        let title: String = Sentence(2..6).fake_with_rng(rng);
        let tickets = FakeTicketAvailability.fake_with_rng(rng);
        let duration = discrete_f32(&[0.5, 1.0, 1.5, 2.0, 2.5, 3.0]).fake_with_rng(rng);
        let cost: Option<u16> = Opt(1..30, 30).fake::<Optional<u16>>().into();

        Self {
            id,
            event_time,
            title,
            tickets,
            duration,
            cost,
        }
    }
}

#[derive(Clone, Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TicketAvailability {
    #[schema(example = 10)]
    pub available: u16,
    #[schema(example = 16)]
    pub total: u16,
}

struct FakeTicketAvailability;

impl Dummy<FakeTicketAvailability> for TicketAvailability {
    fn dummy_with_rng<R: Rng + ?Sized>(_config: &FakeTicketAvailability, rng: &mut R) -> Self {
        let total: u16 = (20..=100).fake_with_rng(rng);
        let available: u16 = (20..=total).fake_with_rng(rng);

        TicketAvailability { total, available }
    }
}

struct DiscreteF32 {
    float_options: Vec<f32>,
}

fn discrete_f32(options: &[f32]) -> DiscreteF32 {
    DiscreteF32 {
        float_options: options.into(),
    }
}

impl Dummy<DiscreteF32> for f32 {
    fn dummy_with_rng<R: Rng + ?Sized>(config: &DiscreteF32, rng: &mut R) -> Self {
        *config
            .float_options
            .choose(rng)
            .expect("discrete_f32 must contain at least one option")
    }
}

#[derive(Serialize, ToSchema)]
pub struct EventType {
    #[schema(example = 10)]
    pub id: u32,
    #[schema(example = "BGM - Board Game")]
    pub type_name: String,
}

#[derive(Serialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EventDetailResponse {
    #[schema(example = 108)]
    pub id: u32,
    #[schema(example = "EVT24ND8193809")]
    pub game_id: String,

    pub game_system: Option<GameSystem>,
    #[schema(example = "EVT - Event")]
    pub event_type: String,
    #[schema(example = "Super Smash Bros Tournament (Semi-final)")]
    pub title: String,
    #[schema(example = "Another round of the super smash bros tournament!")]
    pub description: String,
    #[schema(example = "2024-08-02T11:30:00.000")]
    pub start_time: NaiveDateTime,
    #[schema(example = "2024-08-02T12:00:00.000")]
    pub end_time: NaiveDateTime,
    #[schema(example = 0.5)]
    pub duration: f32,
    #[schema(example = 5)]
    pub cost: Option<u16>,

    #[schema(example = 10)]
    pub tickets_available: u16,
    #[schema(example = 4)]
    pub min_players: u16,
    #[schema(example = 30)]
    pub max_players: u16,

    #[schema(example = "teen")]
    pub age_requirement: String,
    #[schema(example = "expert")]
    pub experience_requirement: String,

    pub location: Location,

    pub materials: Option<Vec<String>>,
    #[schema(example = "jdoe@fake.com")]
    pub contact: Option<String>,
    #[schema(example = "https://www.fake.com")]
    pub website: Option<String>,
    pub game_masters: Vec<GameMaster>,
    pub group: Option<Group>,

    pub tournament_info: Option<TournamentInfo>,
}

pub struct DetailFromBlock<'refdata> {
    pub event_date: NaiveDate,
    pub summary: &'refdata EventSummary,
    pub event_types: &'refdata [String],
    pub event_locations: &'refdata [Location],
    pub game_systems: &'refdata [GameSystem],
    pub organizer_groups: &'refdata [Group],
}

impl Dummy<DetailFromBlock<'_>> for EventDetailResponse {
    fn dummy_with_rng<R: Rng + ?Sized>(config: &DetailFromBlock, rng: &mut R) -> Self {
        let id = config.summary.id;
        // game_id always has the format (3-letter game type) (last 2 year nums) ND (6 digit event number)
        let event_type_short = config.event_types.choose(&mut *rng).unwrap();
        let game_id = String::new() + event_type_short + "24ND" + &id.to_string();
        let game_system: Option<GameSystem> = if Boolean(7).fake_with_rng(&mut *rng) {
            Some(config.game_systems.choose(&mut *rng).unwrap().clone())
        } else {
            None
        };
        let event_type = String::new()
            + event_type_short
            + " - "
            + &Sentence(2..4).fake_with_rng::<String, _>(&mut *rng);
        let title = config.summary.title.clone();
        let description = Sentences(2..11)
            .fake_with_rng::<Vec<String>, _>(&mut *rng)
            .join(" ");
        let start_time = NaiveDateTime::new(config.event_date, config.summary.event_time.0);
        let end_time = if config.summary.duration % 1.0 != 0_f32 {
            start_time + Duration::hours(config.summary.duration as i64) + Duration::minutes(30)
        } else {
            start_time + Duration::hours(config.summary.duration as i64)
        };
        let duration = config.summary.duration;
        let cost = config.summary.cost;
        let tickets_available = config.summary.tickets.available;
        let max_players = config.summary.tickets.total;
        let min_players = (1..=u16::max(max_players / 2, 1)).fake_with_rng(&mut *rng);
        let age_requirement = ["everyone", "kidsonly", "teen", "mature", "adult"]
            .choose(&mut *rng)
            .unwrap()
            .to_string();
        let experience_requirement = ["none", "some", "expert"]
            .choose(&mut *rng)
            .unwrap()
            .to_string();
        let location = config.event_locations.choose(&mut *rng).unwrap().clone();
        let materials: Option<Vec<String>> = Opt(Words(1..6), 30)
            .fake_with_rng::<Optional<Vec<String>>, _>(&mut *rng)
            .into();
        let contact: Option<String> = Opt(SafeEmail(), 80)
            .fake_with_rng::<Optional<String>, _>(&mut *rng)
            .into();
        let website = if Boolean(40).fake_with_rng(&mut *rng) {
            Some("https://www.example.com".to_owned())
        } else {
            None
        };
        let game_masters: Vec<GameMaster> = (Faker, 0..=6).fake_with_rng(&mut *rng);
        let group: Option<Group> = if Boolean(50).fake() {
            Some(config.organizer_groups.choose(&mut *rng).unwrap().clone())
        } else {
            None
        };

        let tournament_info: Option<TournamentInfo> = Opt(Faker, 25)
            .fake_with_rng::<Optional<TournamentInfo>, _>(&mut *rng)
            .into();

        Self {
            id,
            game_id,
            game_system,
            event_type,
            title,
            description,
            start_time,
            end_time,
            duration,
            cost,
            tickets_available,
            max_players,
            min_players,
            age_requirement,
            experience_requirement,
            location,
            materials,
            contact,
            website,
            game_masters,
            group,
            tournament_info,
        }
    }
}

#[derive(Serialize, Dummy, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GameSystem {
    #[dummy(faker = "1..=100")]
    #[schema(example = 58)]
    pub id: u32,
    #[dummy(faker = "Sentence(2..6)")]
    #[schema(example = "Twilight Imperium 4th Edition")]
    pub name: String,
}

#[derive(Serialize, Dummy, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GameMaster {
    #[dummy(faker = "10..=10000")]
    #[schema(example = 40)]
    pub id: u32,
    #[dummy(faker = "Name()")]
    #[schema(example = "John Smith")]
    pub name: String,
}

#[derive(Serialize, Dummy, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    #[dummy(faker = "10..=1000")]
    #[schema(example = 30)]
    pub id: u32,
    #[dummy(faker = "Word()")]
    #[schema(example = "Super Group Ltd.")]
    pub name: String,
}

#[derive(Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    #[schema(example = json!({"id": 5, "name": "JW Marriott"}))]
    pub building: Option<LocationPart>,
    #[schema(example = json!({"id": 18, "name": "3rd Floor Ballroom"}))]
    pub room: Option<LocationPart>,
    #[schema(example = json!({"id": 5, "name": "Section B"}))]
    pub section: Option<LocationPart>,
    #[schema(example = 10)]
    pub table_num: Option<u16>,
}

#[derive(Serialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TournamentInfo {
    #[schema(example = 17)]
    pub id: u32,
    #[schema(example = "Super Smash Bros Ultimate Semifinal")]
    pub name: String,
    #[schema(example = 2)]
    pub current_round: u8,
    #[schema(example = 5)]
    pub total_rounds: u8,
    pub previous_segment: Option<TournamentSegment>,
    pub next_segment: Option<TournamentSegment>,
}

impl Dummy<Faker> for TournamentInfo {
    fn dummy_with_rng<R: Rng + ?Sized>(_: &Faker, rng: &mut R) -> Self {
        let id: u32 = (1..=300).fake_with_rng(&mut *rng);
        let name = Sentence(2..7).fake_with_rng(&mut *rng);
        let current_round = (1..=5).fake_with_rng(&mut *rng);
        let total_rounds = (current_round..=5).fake_with_rng(&mut *rng);
        let previous_segment = if current_round == 1 {
            None
        } else {
            Some(TournamentSegment {
                round: current_round - 1,
                segment_events: (Faker, 1..=4).fake_with_rng(&mut *rng),
            })
        };
        let next_segment = if current_round == total_rounds {
            None
        } else {
            Some(TournamentSegment {
                round: current_round + 1,
                segment_events: (Faker, 1..=4).fake_with_rng(&mut *rng),
            })
        };

        Self {
            id,
            name,
            current_round,
            total_rounds,
            previous_segment,
            next_segment,
        }
    }
}

#[derive(Serialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TournamentSegment {
    #[schema(example = 3)]
    pub round: u8,
    pub segment_events: Vec<RelatedEvent>,
}

#[derive(Serialize, Dummy, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RelatedEvent {
    #[dummy(faker = "10..=10000")]
    #[schema(example = 10)]
    pub id: u32,
    #[dummy(faker = "Word()")]
    #[schema(example = "FAKE")]
    pub event_id: String,
    #[dummy(faker = "Sentence(2..6)")]
    #[schema(example = "LARPing for real!")]
    pub title: String,
}

#[derive(Serialize, Dummy, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LocationPart {
    #[dummy(faker = "10..20")]
    pub id: u32,
    #[dummy(faker = "Sentence(1..3)")]
    pub name: String,
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EventImportRequest {
    /// List of GenCon events to import
    pub event_data: Vec<ImportedEvent>,
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ImportedEvent {
    #[schema(example = "everyone (6+)")]
    /// Event age requirement
    ///
    /// Valid values:
    /// * "Everyone (6+)"
    /// * "Kids Only (12 and under)"
    /// * "Teen (13+)"
    /// * "Mature (18+)"
    /// * "21+"
    pub age_requirement: String,

    #[schema(example = "jdoe22@somewhere.com")]
    /// The contact e-mail for the event organizer. Empty string for no contact.
    pub contact: String,

    #[schema(example = 10)]
    /// The cost of the event (in dollars). 0 if the event is free.
    pub cost: u32,

    #[schema(example = "This is a description of the event. It can be as long as you want. It can even contain multiple paragraphs.")]
    /// Description of the event
    pub description_short: String,

    /// The end date of the event.
    pub end_date: DateDto,

    #[schema(example = "12:00")]
    /// The end time of the event.
    pub end_time: TimeDto,

    #[schema(example = "BGM - Board Game")]
    /// The type of event.
    pub event_type: String,

    #[schema(example = "Some (You've played it a bit and understand the basics)")]
    /// The required experience for the event.
    ///
    /// Valid values:
    /// * None (You've never played before - rules will be taught)"
    /// * Some (You've played it a bit and understand the basics)"
    /// * Expert (You play it regularly and know all the rules)"
    pub experience_type: String,

    #[schema(example = "BGM23ND0192830")]
    /// The GenCon ID for the game
    pub game_id: String,

    #[schema(example = "Dungeons & Dragons")]
    /// The game system used by the event. Empty string if this is not applicable.
    pub game_system: NumberOrString,

    #[schema(example = "John Doe, Jane Smith")]
    /// The names of the game masters for the event, comma-separated.
    pub gm_names: String,

    #[schema(example = "Super Cool Group Ltd.")]
    /// The group running the event. Empty string if not applicable.
    pub group: String,

    #[schema(example = "ICC")]
    /// The building where the game will occur. May include a room, separated by a colon. Empty if this is not applicable.
    pub location: String,

    #[schema(example = "Paper and a pen")]
    /// Required materials for the event. May
    pub materials: String,
    #[schema(example = 3)]
    pub players_min: u16,
    #[schema(example = 8)]
    pub players_max: u16,
    pub start_date: DateDto,
    #[schema(example = "11:00")]
    pub start_time: TimeDto,
    #[schema(example = 10)]
    pub table_num: u16,
    #[schema(example = 3)]
    pub tickets_available: i16,
    #[schema(example = "Delve into the Underdark")]
    pub title: String,
    #[schema(example = true)]
    pub tournament: bool,
    #[schema(example = 213)]
    pub room: NumberOrString,
    #[schema(example = 1)]
    pub round: u8,
    #[schema(example = 3)]
    pub round_total: u8,
    #[schema(example = "www.supercoolgroup.com")]
    pub website: String,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
#[serde(try_from = "String", into = "String")]
#[schema(example = "7/28/2024", value_type = String)]
pub struct DateDto(pub NaiveDate);

impl TryFrom<String> for DateDto {
    type Error = ParseError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Ok(DateDto(NaiveDate::parse_from_str(&value, "%m/%d/%Y")?))
    }
}

impl From<DateDto> for String {
    fn from(value: DateDto) -> Self {
        value.0.format("%m/%d/%Y").to_string()
    }
}

impl DateDto {
    pub fn from_date_id(day_id: u32) -> Self {
        let day = day_id % 100;
        let month = ((day_id - day) % 10000) / 100;
        let year = (day_id - (month * 100) - day) / 10000;

        Self(NaiveDate::from_ymd_opt(year as i32, month, day).unwrap())
    }
}

#[derive(Serialize, Debug, Deserialize, Clone, ToSchema)]
#[serde(try_from = "String", into = "String")]
#[schema(value_type = String)]
pub struct TimeDto(pub NaiveTime);

impl TryFrom<String> for TimeDto {
    type Error = ParseError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Ok(TimeDto(NaiveTime::parse_from_str(&value, "%H:%M")?))
    }
}

impl From<TimeDto> for String {
    fn from(value: TimeDto) -> Self {
        value.0.format("%H:%M").to_string()
    }
}

#[derive(Debug)]
#[expect(dead_code)]
pub enum IngestEventConvertErr {
    BadStartTime,
    BadEndTime,
    UnrecognizedAgeRequirement(String),
    UnrecognizedExperience(String),
}

fn to_option_with_default<T: Eq + Default>(value: T) -> Option<T> {
    if value == T::default() {
        None
    } else {
        Some(value)
    }
}

impl TryFrom<ImportedEvent> for domain::event::IngestEvent {
    type Error = IngestEventConvertErr;

    fn try_from(value: ImportedEvent) -> Result<Self, Self::Error> {
        let start = Tz::America__Indiana__Indianapolis
            .from_local_datetime(&NaiveDateTime::new(value.start_date.0, value.start_time.0))
            .earliest()
            .ok_or(IngestEventConvertErr::BadStartTime)?;
        let end = Tz::America__Indiana__Indianapolis
            .from_local_datetime(&NaiveDateTime::new(value.end_date.0, value.end_time.0))
            .earliest()
            .ok_or(IngestEventConvertErr::BadEndTime)?;
        let age_requirement = match value.age_requirement.to_lowercase().as_str() {
            "everyone (6+)" => AgeRequirement::Everyone,
            "kids only (12 and under)" => AgeRequirement::KidsOnly,
            "teen (13+)" => AgeRequirement::Teen,
            "mature (18+)" => AgeRequirement::Mature,
            "21+" => AgeRequirement::Adult,

            _ => return Err(UnrecognizedAgeRequirement(value.age_requirement)),
        };
        let experience_requirement = match value.experience_type.as_str() {
            "None (You've never played before - rules will be taught)" => ExperienceLevel::None,
            "Some (You've played it a bit and understand the basics)" => ExperienceLevel::Some,
            "Expert (You play it regularly and know all the rules)" => ExperienceLevel::Expert,

            _ => return Err(UnrecognizedExperience(value.experience_type)),
        };
        let (room, section) = match value.room {
            NumberOrString::Number(room_num) => (Some(format!("Room {}", room_num)), None),
            NumberOrString::String(room_section_name) => {
                if room_section_name.is_empty() {
                    (None, None)
                } else {
                    let room_maybe_section: Vec<&str> =
                        room_section_name.as_str().split(" : ").collect();
                    if room_maybe_section.len() == 2 {
                        (
                            Some(room_maybe_section[0].to_owned()),
                            Some(room_maybe_section[1].to_owned()),
                        )
                    } else {
                        (Some(room_section_name), None)
                    }
                }
            }
        };
        let location = if value.location.is_empty() {
            None
        } else {
            let ingest = match (room, section) {
                (None, None) => domain::location::LocationIngest::Location {
                    name: value.location,
                },
                (Some(existing_room), None) => domain::location::LocationIngest::Room {
                    location_name: value.location,
                    room_name: existing_room,
                },
                (Some(existing_room), Some(existing_section)) => {
                    domain::location::LocationIngest::Section {
                        location_name: value.location,
                        room_name: existing_room,
                        section_name: existing_section,
                    }
                }

                (None, Some(_)) => unreachable!(),
            };

            Some(ingest)
        };
        let game_system = match value.game_system {
            NumberOrString::String(str) => str,
            NumberOrString::Number(num) => format!("{}", num),
        };

        Ok(Self {
            game_id: value.game_id,
            game_system: to_option_with_default(game_system),
            event_type: value.event_type,
            title: value.title,
            description: value.description_short,
            start,
            end,
            cost: to_option_with_default(value.cost),
            tickets_available: if value.tickets_available < 0 {
                0
            } else {
                value.tickets_available as u16
            },
            min_players: value.players_min,
            max_players: value.players_max,
            age_requirement,
            experience_requirement,
            location,
            table_number: to_option_with_default(value.table_num),
            materials: to_option_with_default(value.materials),
            contact: to_option_with_default(value.contact),
            website: to_option_with_default(value.website),
            group: to_option_with_default(value.group),
            tournament: if value.tournament {
                Some(domain::tournament::RoundInfoIngest {
                    round: value.round,
                    total_rounds: value.round_total,
                })
            } else {
                None
            },
            game_masters: {
                if value.gm_names.is_empty() {
                    Vec::new()
                } else {
                    value
                        .gm_names
                        .as_str()
                        .split(", ")
                        .map(ToOwned::to_owned)
                        .collect()
                }
            },
        })
    }
}

#[derive(Deserialize, Debug, ToSchema)]
#[serde(untagged)]
pub enum NumberOrString {
    Number(u16),
    String(String),
}

/// Contains diagnostic information about an API failure
#[derive(Serialize, Debug, ToSchema)]
#[cfg_attr(test, derive(Deserialize))]
#[serde(rename_all = "camelCase")]
pub struct BasicError {
    /// A sentinel value that can be used to differentiate between different causes of a non-2XX
    /// HTTP response code
    pub error_code: String,
    /// A human-readable error message suitable for showing to users
    pub error_description: String,

    /// Additional contextual information, such as what validations failed on a request DTO
    #[serde(skip_deserializing)]
    pub extra_info: Option<ExtraInfo>,
}

/// Contains a set of generic OpenAPI error responses based on [BasicError] that can
/// be easily reused in other requests
pub mod err_resps {
    #![expect(dead_code)]

    use utoipa::ToResponse;

    use crate::dto::BasicError;

    #[derive(ToResponse)]
    #[response(
        description = "Invalid request body was passed",
        example = json!({
            "errorCode": "invalid_input",
            "errorDescription": "Submitted data was invalid.",
            "extraInfo": {
                "firstName": [
                    {
                        "code": "length",
                        "message": null,
                        "params": {
                            "value": "Nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                            "max": 30
                        }
                    }
                ]
            }
        })
    )]
    pub struct BasicError400Validation(BasicError);

    #[derive(ToResponse)]
    #[response(
        description = "Entity could not be found",
        example = json!({
            "errorCode": "not_found",
            "errorDescription": "The requested entity could not be found.",
            "extraInfo": null
        })
    )]
    pub struct BasicError404(BasicError);

    #[derive(ToResponse)]
    #[response(
        description = "Something unexpected went wrong inside the server",
        example = json!({
            "errorCode": "internal_error",
            "errorDescription": "Could not access data to complete your request",
            "extraInfo": null
        })
    )]
    pub struct BasicError500(BasicError);
}

/// Extra contextual information which explains why an API error occurred
#[derive(Serialize, Debug, ToSchema)]
#[serde(untagged)]
pub enum ExtraInfo {
    ValidationIssues(ValidationErrorSchema),
    Message(String),
}

/// Stand-in OpenAPI schema for [ValidationErrors] which just provides an empty object
#[derive(Serialize, Debug)]
#[serde(transparent)]
pub struct ValidationErrorSchema(pub ValidationErrors);

impl<'schem> ToSchema<'schem> for ValidationErrorSchema {
    fn schema() -> (&'schem str, RefOr<Schema>) {
        (
            "ValidationErrorSchema",
            openapi::ObjectBuilder::new().into(),
        )
    }
}
