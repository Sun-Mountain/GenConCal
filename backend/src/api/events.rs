use std::borrow::Cow;
use std::collections::HashMap;
use std::sync::{Arc, OnceLock};

use axum::extract::State;
use axum::response::ErrorResponse;
use axum::Router;
use axum::routing::get;
use chrono::{NaiveDate, NaiveTime};
use fake::Fake;
use utoipa::OpenApi;
use validator::{Validate, ValidationError};

use crate::{AppState, dto, SharedData};
use crate::dto::{CommaSeparated, EventBlock, EventDay, TimeDto};
use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::Json;

#[derive(OpenApi)]
#[openapi(paths(
    list_event_counts_by_day,
))]
pub struct EventsApi;

pub const EVENTS_API_GROUP: &str = "Events";

#[derive(Validate)]
#[validate(schema(function = "validate_eventlist_query"))]
pub struct EventListQueryParams {
    page: Option<u16>,
    limit: Option<u16>,
    min_available_tickets: Option<u16>,
    event_types: Option<CommaSeparated<i32>>,
    #[validate(custom(function = "validate_experience_list"))]
    experience: Option<CommaSeparated<String>>,
    #[validate(custom(function = "validate_age_list"))]
    age: Option<CommaSeparated<String>>,
    game_systems: Option<CommaSeparated<i32>>,
    groups: Option<CommaSeparated<i32>>,
    locations: Option<CommaSeparated<i32>>,
    show_tournaments: Option<bool>,
    start_time: Option<TimeDto>,
    end_time: Option<TimeDto>,
    min_duration: Option<f32>,
    max_duration: Option<f32>,
    search_text: Option<String>,
    cost_min: Option<u16>,
    cost_max: Option<u16>,
}

fn validate_eventlist_query(query_params: &EventListQueryParams) -> Result<(), ValidationError> {
    // Validate start_time <= end_time
    if let (Some(TimeDto(start_time)), Some(TimeDto(end_time))) =
        (&query_params.start_time, &query_params.end_time)
    {
        if start_time > end_time {
            return Err(
                ValidationError::new("bad_event_time_order").with_message(Cow::Borrowed(
                    "Event start time must be less than or equal to end time.",
                )),
            );
        }
    }

    // Validate min_duration <= max_duration
    if let (Some(min_duration), Some(max_duration)) =
        (&query_params.min_duration, &query_params.max_duration)
    {
        if min_duration > max_duration {
            return Err(
                ValidationError::new("bad_duration_order").with_message(Cow::Borrowed(
                    "Event minimum duration cannot exceed maximum duration.",
                )),
            );
        }
    }

    // Validate cost_min <= cost_max
    if let (Some(cost_min), Some(cost_max)) = (&query_params.cost_min, &query_params.cost_max) {
        if cost_min > cost_max {
            return Err(ValidationError::new("bad_cost_order")
                .with_message(Cow::Borrowed("Minimum cost cannot exceed maximum cost.")));
        }
    }

    Ok(())
}

fn validate_experience_list(
    type_list: &Option<CommaSeparated<String>>,
) -> Result<(), ValidationError> {
    if let Some(CommaSeparated(ref str_list)) = type_list {
        for str_to_check in str_list.iter() {
            match str_to_check.as_str() {
                "none" | "some" | "expert" => {}
                _ => return Err(ValidationError::new("invalid_experience_value")
                    .with_message(Cow::Owned(format!("One or more experience values ({}) were not recognized. Valid values are: none, some, expert", str_to_check))))
            }
        }
    }

    Ok(())
}

fn validate_age_list(age_list: &Option<CommaSeparated<String>>) -> Result<(), ValidationError> {
    if let Some(CommaSeparated(ref str_list)) = age_list {
        for str_to_check in str_list.iter() {
            match str_to_check.as_str() {
                "everyone" | "kidsonly" | "teen" | "mature" | "adult" => {}
                _ => return Err(ValidationError::new("invalid_age_value")
                    .with_message(Cow::Owned(format!("One or more age range values ({}) were not recognized. Valid values are: everyone, kidsonly, teen, mature, adult", str_to_check))))
            }
        }
    }

    Ok(())
}

pub fn events_routes() -> Router<Arc<SharedData>> {
    Router::new().route(
        "/",
        get(|State(app_data): AppState| async move {
            let mut ext_cxn = app_data.ext_cxn.clone();

            // TODO call list_events here
        }),
    ).route(
        "/counts/daily",
        get(|State(app_data): AppState| async move {
            let mut ext_cxn = app_data.ext_cxn.clone();

            list_event_counts_by_day(&mut ext_cxn).await
        }),
    )
}

fn gen_day_blocks() -> Vec<dto::EventBlock> {
    let mut ten_am_events: Vec<dto::EventSummary> = (dto::event_in_time_slot(10), 5..20).fake();
    let mut eleven_am_events: Vec<dto::EventSummary> = (dto::event_in_time_slot(11), 10..40).fake();
    let mut one_pm_events: Vec<dto::EventSummary> = (dto::event_in_time_slot(13), 7..20).fake();
    
    ten_am_events.sort_by(|evt1, evt2| evt1.event_time.0.cmp(&evt2.event_time.0));
    eleven_am_events.sort_by(|evt1, evt2| evt1.event_time.0.cmp(&evt2.event_time.0));
    one_pm_events.sort_by(|evt1, evt2| evt1.event_time.0.cmp(&evt2.event_time.0));
    
    vec![
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(10, 0, 0).unwrap()),
            events: ten_am_events,
        },
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(11, 0, 0).unwrap()),
            events: eleven_am_events,
        },
        EventBlock {
            represented_time: TimeDto(NaiveTime::from_hms_opt(13, 0, 0).unwrap()),
            events: one_pm_events,
        },
    ]
}

pub(super) fn event_data() -> &'static dto::DailyTimeBlockedEventsResponse {
    static EVENTS_CELL: OnceLock<dto::DailyTimeBlockedEventsResponse> = OnceLock::new();
    let events = EVENTS_CELL.get_or_init(|| dto::DailyTimeBlockedEventsResponse {
        events_by_day: HashMap::from([
            (20240731, gen_day_blocks()),
            (20240801, gen_day_blocks()),
            (20240802, gen_day_blocks()),
            (20240803, gen_day_blocks()),
        ]),
    });

    events
}

#[utoipa::path(
    get,
    path = "/api/events/counts/daily",
    tag = EVENTS_API_GROUP,
    responses(
    (status = 200, description = "List of convention days was successfully retrieved", body = DaysResponse),
    (status = 500, response = dto::err_resps::BasicError500),
    )
)]
/// Lists the number of events by day for the current GenCon year
async fn list_event_counts_by_day(
    _: &mut impl ExternalConnectivity,
) -> Result<Json<dto::DaysResponse>, ErrorResponse> {
    let event_data = event_data();
    let mut days: Vec<EventDay> = event_data.events_by_day.iter()
        .map(|(day_id, event_list)| {
            let day = day_id % 100;
            let month = ((day_id - day) % 10000) / 100;
            let year = (day_id - (month * 100) - day) / 10000;

            let total_events: u16 = event_list.iter().map(|block| block.events.len() as u16).sum();

            EventDay {
                day_id: *day_id,
                date: dto::DateDto(NaiveDate::from_ymd_opt(year as i32, month, day).unwrap()),
                total_events,
            }
        }).collect();
    days.sort_by(|day1, day2| day1.day_id.cmp(&day2.day_id));
    let dummy_resp_data = dto::DaysResponse {
        days,
    };

    Ok(Json(dummy_resp_data))
}
