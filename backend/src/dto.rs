use chrono::{NaiveDate, NaiveDateTime, NaiveTime, ParseError, TimeZone};
use chrono_tz::Tz;
use serde::{Deserialize, Serialize};
use utoipa::openapi::{RefOr, Schema};
use utoipa::{openapi, OpenApi, ToSchema};
use validator::ValidationErrors;

use crate::domain;
use crate::domain::event::{AgeRequirement, ExperienceLevel};
use crate::dto::IngestEventConvertErr::{UnrecognizedAgeRequirement, UnrecognizedExperience};

#[derive(OpenApi)]
#[openapi(components(
    schemas(BasicError, ExtraInfo, ValidationErrorSchema,),
    responses(
        err_resps::BasicError400Validation,
        err_resps::BasicError404,
        err_resps::BasicError500,
    ),
))]
/// Captures OpenAPI schemas and canned responses defined in the DTO module
pub struct OpenApiSchemas;

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct EventDay {
    #[schema(example = 20240708)]
    day_id: u32,
    #[schema(example = "7/8/2024")]
    date: DateDto,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TimeInfo {
    #[schema(example = )]
    earliest_time: TimeDto,
    latest_time: TimeDto,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventImportRequest {
    pub event_data: Vec<ImportedEvent>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportedEvent {
    pub age_requirement: String,
    pub contact: String,
    pub cost: u16,
    pub description_short: String,
    pub end_date: DateDto,
    pub end_time: TimeDto,
    pub event_type: String,
    pub experience_type: String,
    pub game_id: String,
    pub game_system: NumberOrString,
    pub gm_names: String,
    pub group: String,
    pub location: String,
    pub materials: String,
    pub players_min: u16,
    pub players_max: u16,
    pub start_date: DateDto,
    pub start_time: TimeDto,
    pub table_num: u16,
    pub tickets_available: i16,
    pub title: String,
    pub tournament: bool,
    pub room: NumberOrString,
    pub round: u8,
    pub round_total: u8,
    pub website: String,
}

#[derive(Deserialize)]
#[serde(try_from = "String", into = "String")]
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

#[derive(Deserialize)]
#[serde(try_from = "String", into = "String")]
pub struct TimeDto(NaiveTime);

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
                if value.gm_names == "" {
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

#[derive(Deserialize)]
#[serde(untagged)]
pub enum NumberOrString {
    Number(u16),
    String(String),
}

/// Contains diagnostic information about an API failure
#[derive(Serialize, Debug, ToSchema)]
#[cfg_attr(test, derive(Deserialize))]
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
    use utoipa::ToResponse;

    use crate::dto::BasicError;

    #[derive(ToResponse)]
    #[response(
        description = "Invalid request body was passed",
        example = json!({
            "error_code": "invalid_input",
            "error_description": "Submitted data was invalid.",
            "extra_info": {
                "first_name": [
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
            "error_code": "not_found",
            "error_description": "The requested entity could not be found.",
            "extra_info": null
        })
    )]
    pub struct BasicError404(BasicError);

    #[derive(ToResponse)]
    #[response(
        description = "Something unexpected went wrong inside the server",
        example = json!({
            "error_code": "internal_error",
            "error_description": "Could not access data to complete your request",
            "extra_info": null
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
