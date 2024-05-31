use std::cell::OnceCell;
use std::collections::HashMap;
use std::sync::{Arc, OnceLock};

use axum::extract::State;
use axum::Router;
use axum::routing::get;
use chrono::NaiveTime;
use fake::Fake;
use utoipa::OpenApi;

use crate::{AppState, dto, SharedData};
use crate::dto::{EventBlock, TimeDto};
use crate::external_connections::ExternalConnectivity;

#[derive(OpenApi)]
#[openapi(paths())]
pub struct EventsApi;

pub const EVENTS_API_GROUP: &str = "Events";

pub fn events_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route(
            "/",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                // TODO call list_events here
            })
        )
}

fn gen_day_blocks() -> Vec<dto::EventBlock> {
    vec![
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(10, 0, 0).unwrap()),
            events: (dto::event_in_time_slot(10), 5..30).fake(),
        },
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(11, 0, 0).unwrap()),
            events: (dto::event_in_time_slot(11), 10..40).fake(),
        },
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(13, 0, 0).unwrap()),
            events: (dto::event_in_time_slot(13), 7..20).fake(),
        }
    ]
}

fn event_data() -> &'static dto::DailyTimeBlockedEventsResponse {
    static EVENTS_CELL: OnceLock<dto::DailyTimeBlockedEventsResponse> = OnceLock::new();
    let events = EVENTS_CELL.get_or_init(|| {
        dto::DailyTimeBlockedEventsResponse {
            events_by_day: HashMap::from([
                (20240731, gen_day_blocks()),
                (20240801, gen_day_blocks()),
                (20240802, gen_day_blocks()),
            ]),
        }
    });

    events
}

// TODO add openapi docs to this func & attach to EventsApige
async fn list_events(ext_cxn: &mut impl ExternalConnectivity) {
    // TODO implement /api/events here
}