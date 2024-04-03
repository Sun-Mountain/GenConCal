use chrono::{NaiveDate, NaiveTime};
use crate::domain;
use derive_more::Display;
use serde::{Deserialize, Serialize};
use serde_json::Number;
use utoipa::openapi::{RefOr, Schema};
use utoipa::{openapi, OpenApi, ToSchema};
use validator::{Validate, ValidationErrors};

#[derive(OpenApi)]
#[openapi(components(
    schemas(
        BasicError,
        ExtraInfo,
        ValidationErrorSchema,
    ),
    responses(
        err_resps::BasicError400Validation,
        err_resps::BasicError404,
        err_resps::BasicError500,
    ),
))]
/// Captures OpenAPI schemas and canned responses defined in the DTO module
pub struct OpenApiSchemas;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventImportRequest {
    event_data: Vec<ImportedEvent>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportedEvent {
    age_requirement: String,
    contact: String,
    cost: u8,
    description_short: String,
    end_date: NaiveDate,
    end_time: NaiveTime,
    event_type: String,
    experience_type: String,
    game_id: String,
    game_system: String,
    gm_names: String,
    group: String,
    location: String,
    materials: String,
    players_min: i16,
    players_max: i16,
    start_date: NaiveDate,
    start_time: NaiveTime,
    table_num: u16,
    tickets_available: i16,
    title: String,
    tournament: bool,
    room: NumberOrString,
    round: u8,
    round_total: u8,
    website: String,
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
    use crate::dto::BasicError;
    use utoipa::ToResponse;

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
