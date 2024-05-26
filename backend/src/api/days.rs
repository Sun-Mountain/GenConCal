use std::sync::Arc;
use axum::extract::State;
use axum::response::ErrorResponse;
use axum::Router;
use axum::routing::get;
use chrono::NaiveDate;
use fake::Fake;
use utoipa::OpenApi;
use crate::{AppState, dto, SharedData};
use crate::dto::EventDay;
use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::Json;

#[derive(OpenApi)]
#[openapi(paths(
    list_days
))]
pub struct DaysApi;

pub const DAYS_API_GROUP: &str = "Days";

pub fn day_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route(
            "/",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                list_days(&mut ext_cxn).await
            })
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
async fn list_days(ext_cxn: &mut impl ExternalConnectivity) -> Result<Json<dto::DaysResponse>, ErrorResponse> {
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
            }
        ]
    };

    Ok(Json(dummy_resp_data))
}