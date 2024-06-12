use crate::dto::EventDay;
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
#[openapi(paths(list_days, day_time_info,))]
pub struct DaysApi;

pub const DAYS_API_GROUP: &str = "Days";

pub fn day_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route(
            "/",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                list_days(&mut ext_cxn).await
            }),
        )
        .route(
            "/:day_id/time-info",
            get(
                |State(app_data): AppState, Path(day_id): Path<u32>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();

                    day_time_info(day_id, &mut ext_cxn).await
                },
            ),
        )
}

#[utoipa::path(
    get,
    path = "/api/days",
    tag = DAYS_API_GROUP,
    responses(
        (status = 200, description = "List of convention days was successfully retrieved", body = DaysResponse),
        (status = 500, response = dto::err_resps::BasicError500),
    )
)]
async fn list_days(
    _: &mut impl ExternalConnectivity,
) -> Result<Json<dto::DaysResponse>, ErrorResponse> {
    let dummy_resp_data = dto::DaysResponse {
        days: vec![
            EventDay {
                day_id: 20240731,
                date: dto::DateDto(NaiveDate::from_ymd_opt(2024, 7, 31).unwrap()),
                total_events: (200..=300).fake(),
            },
            EventDay {
                day_id: 20240801,
                date: dto::DateDto(NaiveDate::from_ymd_opt(2024, 8, 1).unwrap()),
                total_events: (2000..=9000).fake(),
            },
            EventDay {
                day_id: 20240802,
                date: dto::DateDto(NaiveDate::from_ymd_opt(2024, 8, 2).unwrap()),
                total_events: (2000..=9000).fake(),
            },
            EventDay {
                day_id: 20240803,
                date: dto::DateDto(NaiveDate::from_ymd_opt(2024, 8, 3).unwrap()),
                total_events: (1000..=5000).fake(),
            },
        ],
    };

    Ok(Json(dummy_resp_data))
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
