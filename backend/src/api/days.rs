use crate::dto::{EventDay, TimeBlockedEventsResponse};
use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::Json;
use crate::{dto, AppState, SharedData};
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{ErrorResponse, IntoResponse};
use axum::routing::get;
use axum::Router;
use chrono::{NaiveDate, NaiveTime};
use fake::Fake;
use std::sync::Arc;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(
    list_events_by_day,
    day_time_info,
))]
pub struct DaysApi;

pub const DAYS_API_GROUP: &str = "Days";

pub fn day_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route(
            "/:day_id/time-info",
            get(
                |State(app_data): AppState, Path(day_id): Path<u32>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();

                    day_time_info(day_id, &mut ext_cxn).await
                },
            ),
        ).route(
            "/:day_id/events",
            get(
                |State(app_data): AppState, Path(day_id): Path<u32>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();
                    
                    list_events_by_day(day_id, &mut ext_cxn).await
                }
            )
        )
}


#[utoipa::path(
    get,
    path = "/api/days/{day_id}/events",
    tag = DAYS_API_GROUP,
    params(
        ("day_id" = u32, Path, description = "The ID of the day to look up the list of events for (YYYYMMDD format)"),
    ),
    responses(
        (status = 200, description = "Events successfully retrieved", body = TimeBlockedEventsResponse),
        (
            status = 404,
            description = "No GenCon dates have the requested day ID",
            body = BasicError,
            example = json!({
                "errorCode": "no_matching_day",
                "errorDescription": "The requested date was not found in the system.",
                "extraInfo": null
            }),
        ),
        (status = 500, response = dto::err_resps::BasicError500),
    ),
)]
/// List events that occur on a certain day
async fn list_events_by_day(day_id: u32, ext_cxn: &mut impl ExternalConnectivity) -> Result<Json<TimeBlockedEventsResponse>, ErrorResponse> {
    let event_data = super::events::event_data();
    let events_for_day_opt = event_data.events_by_day.get(&day_id);
    let events_for_day = match events_for_day_opt {
        Some(event_list) => event_list,
        None => return Err((
            StatusCode::NOT_FOUND,
            Json(dto::BasicError {
                error_code: "no_matching_day".to_owned(),
                error_description: "The requested date was not found in the system.".to_owned(),
                extra_info: None,
            })
        ).into())
    };
    
    let resp = TimeBlockedEventsResponse {
        pagination_info: dto::PaginationInfo {
            page: 1,
            total_pages: 1,
        },
        events_by_time: events_for_day.clone(),
    };

    Ok(Json(resp))
}

#[utoipa::path(
    get,
    path = "/api/days/{day_id}/time-info",
    tag = DAYS_API_GROUP,
    params(
        ("day_id" = u32, Path, description = "The ID of the day to look up time info for (YYYYMMDD format)"),
    ),
    responses(
        (status = 200, description = "Time information successfully retrieved", body = TimeInfoResponse),
        (
            status = 404,
            description = "No GenCon dates have the requested day ID",
            body = BasicError,
            example = json!({
                "errorCode": "no_matching_day",
                "errorDescription": "The passed day does not exist in the system.",
                "extraInfo": null
            }),
        ),
        (status = 500, response = dto::err_resps::BasicError500),
    ),
)]
/// Lists the earliest and latest start times for events on a given day
async fn day_time_info(
    day_id: u32,
    _: &mut impl ExternalConnectivity,
) -> Result<Json<dto::TimeInfoResponse>, ErrorResponse> {
    let dummy_resp_data = match day_id {
        20240731 | 20240801 | 20240802 => dto::TimeInfoResponse {
            earliest_time: dto::TimeDto(NaiveTime::from_hms_opt(10, 0, 0).unwrap()),
            latest_time: dto::TimeDto(NaiveTime::from_hms_opt(13, 0, 0).unwrap()),
        },

        _ => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(dto::BasicError {
                    error_code: "no_matching_day".to_owned(),
                    error_description: "The passed day does not exist in the system.".to_owned(),
                    extra_info: None,
                }),
            )
                .into())
        }
    };

    Ok(Json(dummy_resp_data))
}
