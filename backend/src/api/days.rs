use crate::api::{events, PaginationQueryParams};
use crate::dto::TimeBlockedEventsResponse;
use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::{Json, ValidationErrorResponse};
use crate::{api, dto, AppState, SharedData};
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::ErrorResponse;
use axum::routing::get;
use axum::Router;
use chrono::NaiveTime;
use tracing::*;

use std::sync::Arc;
use utoipa::OpenApi;
use validator::Validate;

#[derive(OpenApi)]
#[openapi(paths(list_events_by_day, day_time_info,))]
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
        )
        .route(
            "/:day_id/events",
            get(
                |State(app_data): AppState,
                 Path(day_id): Path<u32>,
                 Query(filter): Query<events::EventListQueryParams>,
                 Query(pagination): Query<api::PaginationQueryParams>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();

                    list_events_by_day(day_id, &filter, &pagination, &mut ext_cxn).await
                },
            ),
        )
}

#[utoipa::path(
    get,
    path = "/api/days/{day_id}/events",
    tag = DAYS_API_GROUP,
    params(
        ("day_id" = u32, Path, description = "The ID of the day to look up the list of events for (YYYYMMDD format)"),
        events::EventListQueryParams,
        PaginationQueryParams,
    ),
    responses(
        (status = 200, description = "Events successfully retrieved", body = TimeBlockedEventsResponse),
        (status = 400, response = dto::err_resps::BasicError400Validation),
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
#[instrument(skip(filter, _ext_cxn))]
/// List events that occur on a certain day
async fn list_events_by_day(
    day_id: u32,
    filter: &events::EventListQueryParams,
    pagination: &api::PaginationQueryParams,
    _ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Json<TimeBlockedEventsResponse>, ErrorResponse> {
    filter.validate().map_err(ValidationErrorResponse)?;
    pagination.validate().map_err(ValidationErrorResponse)?;

    let event_data = events::event_data();
    let events_for_day_opt = event_data.events_by_day.get(&day_id);
    let events_for_day = match events_for_day_opt {
        Some(event_list) => event_list,
        None => {
            error!(day_id, "Day doesn't exist.");
            return Err((
                StatusCode::NOT_FOUND,
                Json(dto::BasicError {
                    error_code: "no_matching_day".to_owned(),
                    error_description: "The requested date was not found in the system.".to_owned(),
                    extra_info: None,
                }),
            )
                .into());
        }
    };

    let mut events_on_day = events_for_day.clone();
    info_span!("event_filtering").in_scope(|| {
        for time_block in events_on_day.iter_mut() {
            time_block
                .events
                .retain(|event| super::events::matches_event_filter(event, filter));
        }
    });
    events_on_day.retain(|block| !block.events.is_empty());

    let page = pagination.page.unwrap_or(1);
    let results_per_page = pagination.limit.unwrap_or(50);
    let total_results = super::events::paginate_events(&mut events_on_day, page, results_per_page);
    let total_pages = super::total_pages(results_per_page, total_results);

    events_on_day.retain(|block| !block.events.is_empty());

    let resp = TimeBlockedEventsResponse {
        pagination_info: dto::PaginationInfo { page, total_pages },
        events_by_time: events_on_day,
    };

    let total_events: usize = resp
        .events_by_time
        .iter()
        .map(|time_block| time_block.events.len())
        .sum();
    info!(
        day_id,
        total_events,
        result_page = resp.pagination_info.page,
        "Returned events for day.",
    );
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
#[instrument]
/// Lists the earliest and latest start times for events on a given day
async fn day_time_info(
    day_id: u32,
    _: &mut impl ExternalConnectivity,
) -> Result<Json<dto::TimeInfoResponse>, ErrorResponse> {
    let dummy_resp_data = match day_id {
        20240731 | 20240801 | 20240802 | 20240803 => dto::TimeInfoResponse {
            earliest_time: dto::TimeDto(NaiveTime::from_hms_opt(10, 0, 0).unwrap()),
            latest_time: dto::TimeDto(NaiveTime::from_hms_opt(13, 0, 0).unwrap()),
        },

        _ => {
            error!(day_id, "Day doesn't exist.");
            return Err((
                StatusCode::NOT_FOUND,
                Json(dto::BasicError {
                    error_code: "no_matching_day".to_owned(),
                    error_description: "The passed day does not exist in the system.".to_owned(),
                    extra_info: None,
                }),
            )
                .into());
        }
    };

    info!(day_id, "Retrieved earliest and latest times.");
    Ok(Json(dummy_resp_data))
}
