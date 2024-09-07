use std::borrow::Cow;
use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::BufReader;
use std::sync::{Arc, Mutex, MutexGuard, OnceLock};

use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::ErrorResponse;
use axum::routing::get;
use axum::Router;
use chrono::NaiveTime;
use fake::Fake;
use log::*;
use serde::Deserialize;
use utoipa::{IntoParams, OpenApi};
use validator::{Validate, ValidationError};

use crate::api::{determine_page_limits, PageRange};
use crate::dto::{
    CommaSeparated, EventBlock, EventDay, EventDetailResponse, EventSummary, GameSystem, Location,
    TimeDto,
};
use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::{Json, ValidationErrorResponse};
use crate::{dto, AppState, SharedData};

#[derive(OpenApi)]
#[openapi(paths(
    list_event_counts_by_day,
    retrieve_event_detail,
    retrieve_game_systems,
    retrieve_event_types,
    retrieve_locations
))]
pub struct EventsApi;

pub const EVENTS_API_GROUP: &str = "Events";

#[derive(Validate, Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
#[validate(schema(function = "validate_eventlist_query"))]
#[serde(rename_all = "kebab-case")]
#[expect(dead_code)]
pub struct EventListQueryParams {
    /// Lower bound for available tickets in returned events (default 0)
    pub min_available_tickets: Option<u16>,
    /// Comma separated list of event type IDs to filter for
    pub event_types: Option<CommaSeparated<u32>>,

    #[validate(custom(function = "validate_experience_list"))]
    /// Comma separated list of experience levels to filter for (acceptable values are none, some, or expert)
    pub experience: Option<CommaSeparated<String>>,

    #[validate(custom(function = "validate_age_list"))]
    /// Comma separated list of age brackets to filter for (acceptable values are everyone, kidsonly, teen, mature, or adult)
    pub age: Option<CommaSeparated<String>>,

    /// Comma separated list of game system IDs to filter for
    pub game_systems: Option<CommaSeparated<u32>>,
    /// Comma separated list of organizer group IDs to filter for
    pub groups: Option<CommaSeparated<u32>>,
    /// Comma separated list of location IDs to filter for
    pub locations: Option<CommaSeparated<u32>>,
    /// Whether or not to show events that are part of a tournament (default true)
    pub show_tournaments: Option<bool>,
    /// Time in HH:MM 24-hour format, the earliest start time of returned events
    pub start_time: Option<TimeDto>,
    /// Time in HH:MM 24-hour format, the latest start time of returned events
    pub end_time: Option<TimeDto>,
    /// The shortest duration of returned events
    pub min_duration: Option<f32>,
    /// The longest duration of returned events
    pub max_duration: Option<f32>,
    /// Partial event title to search for
    pub search_text: Option<String>,
    /// The lowest event price that should be returned in results
    pub cost_min: Option<u16>,
    /// The highest event price that should be returned in results
    pub cost_max: Option<u16>,
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

pub(super) fn matches_event_filter(
    evt_summary: &dto::EventSummary,
    filter: &EventListQueryParams,
) -> bool {
    // Time filter
    if let Some(TimeDto(min_start)) = &filter.start_time {
        if evt_summary.event_time.0 < *min_start {
            return false;
        }
    }
    if let Some(TimeDto(max_start)) = &filter.end_time {
        if evt_summary.event_time.0 > *max_start {
            return false;
        }
    }

    // Search text filter
    if let Some(search_text) = &filter.search_text {
        if !evt_summary.title.contains(search_text) {
            return false;
        }
    }

    // Ticket availability filter
    if let Some(min_available_tix) = filter.min_available_tickets {
        if evt_summary.tickets.available < min_available_tix {
            return false;
        }
    }

    // Duration filter
    if let Some(min_duration) = filter.min_duration {
        if evt_summary.duration < min_duration {
            return false;
        }
    }
    if let Some(max_duration) = filter.max_duration {
        if evt_summary.duration > max_duration {
            return false;
        }
    }

    // Cost filter
    if let (Some(min_cost), Some(actual_cost)) = (filter.cost_min, evt_summary.cost) {
        if actual_cost < min_cost {
            return false;
        }
    }
    if let (Some(max_cost), Some(actual_cost)) = (filter.cost_max, evt_summary.cost) {
        if actual_cost > max_cost {
            return false;
        }
    }

    true
}

pub(super) fn paginate_additional_events(
    blocks: &mut [EventBlock],
    page: u16,
    results_per_page: u16,
    results_already_processed: usize,
) -> usize {
    let mut processed_results = results_already_processed;
    let PageRange {
        page_start,
        page_end,
    } = determine_page_limits(page, results_per_page);

    // If we're before the result page, get up to the result page
    if processed_results < page_start {
        for block in blocks.iter_mut() {
            if block.events.len() + processed_results < page_start {
                processed_results += block.events.len();
                block.events.clear()
            } else {
                let events_outside_page = page_start - processed_results;
                processed_results += events_outside_page;
                block.events.drain(..events_outside_page);
            }
        }
    }

    // If we went through all events and didn't hit the page start, just return the processed event count
    if blocks.iter().all(|block| block.events.is_empty()) {
        return processed_results;
    }

    // Consume as many results as we can up to the page limit
    for block in blocks.iter_mut() {
        if processed_results + block.events.len() < page_end {
            // If the entirety of this block is within the page, keep everything
            processed_results += block.events.len()
        } else if processed_results > page_end {
            // If we're beyond the page limit, clear out everything else
            processed_results += block.events.len();
            block.events.clear();
        } else {
            // We only need to clear out the last few results (the ones off the end of the page)
            let results_to_keep = page_end - processed_results;
            processed_results += block.events.len();
            block.events.drain(results_to_keep..);
        }
    }

    processed_results
}

pub(super) fn paginate_events(
    blocks: &mut [EventBlock],
    page: u16,
    results_per_page: u16,
) -> usize {
    paginate_additional_events(blocks, page, results_per_page, 0)
}

pub fn events_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route(
            "/counts/daily",
            get(
                |State(app_data): AppState, Query(filter): Query<EventListQueryParams>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();

                    list_event_counts_by_day(&filter, &mut ext_cxn).await
                },
            ),
        )
        .route(
            "/:event_id",
            get(
                |State(app_data): AppState, Path(event_id): Path<u32>| async move {
                    let mut ext_cxn = app_data.ext_cxn.clone();

                    retrieve_event_detail(event_id, &mut ext_cxn).await
                },
            ),
        )
        .route(
            "/game-systems",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                retrieve_game_systems(&mut ext_cxn).await
            }),
        )
        .route(
            "/locations",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                retrieve_locations(&mut ext_cxn).await
            }),
        )
        .route(
            "/types",
            get(|State(app_data): AppState| async move {
                let mut ext_cxn = app_data.ext_cxn.clone();

                retrieve_event_types(&mut ext_cxn).await
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

fn game_systems() -> &'static [dto::GameSystem] {
    static SYSTEMS_CELL: OnceLock<Vec<dto::GameSystem>> = OnceLock::new();
    let game_systems = SYSTEMS_CELL.get_or_init(|| {
        let file_reader = File::open("./unique-games.json")
            .expect("unique-games.json should exist and be readable!");
        let buf_reader = BufReader::new(file_reader);
        let sys_names: Vec<String> = serde_json::from_reader(buf_reader)
            .expect("unique-games.json should be able to be parsed into a Vec<String>!");

        sys_names
            .into_iter()
            .enumerate()
            .map(|(idx, name)| dto::GameSystem {
                id: (idx + 1) as u32,
                name,
            })
            .collect()
    });

    game_systems
}

fn locations() -> &'static [dto::Location] {
    static LOCATIONS_CELL: OnceLock<[dto::Location; 3]> = OnceLock::new();
    let locations = LOCATIONS_CELL.get_or_init(|| {
        [
            Location {
                building: Some(dto::LocationPart {
                    id: 1,
                    name: "ICC".to_owned(),
                }),
                room: Some(dto::LocationPart {
                    id: 1,
                    name: "Room 212".to_owned(),
                }),
                section: None,
                table_num: None,
            },
            Location {
                building: Some(dto::LocationPart {
                    id: 2,
                    name: "Hyatt".to_owned(),
                }),
                room: Some(dto::LocationPart {
                    id: 2,
                    name: "Studio 5".to_owned(),
                }),
                section: None,
                table_num: Some(3),
            },
            Location {
                building: Some(dto::LocationPart {
                    id: 3,
                    name: "Stadium".to_owned(),
                }),
                room: Some(dto::LocationPart {
                    id: 3,
                    name: "Field".to_owned(),
                }),
                section: Some(dto::LocationPart {
                    id: 1,
                    name: "Rising Phoenix".to_owned(),
                }),
                table_num: None,
            },
        ]
    });

    locations
}

fn event_types() -> &'static [String] {
    static EVT_TYPE_CELL: OnceLock<[String; 5]> = OnceLock::new();
    let events = EVT_TYPE_CELL.get_or_init(|| {
        [
            "BGM".to_owned(),
            "RPG".to_owned(),
            "SPA".to_owned(),
            "MHE".to_owned(),
            "ENT".to_owned(),
        ]
    });

    events
}

fn event_detail_cache() -> MutexGuard<'static, HashMap<u32, dto::EventDetailResponse>> {
    static DETAIL_MUTEX: OnceLock<Mutex<HashMap<u32, dto::EventDetailResponse>>> = OnceLock::new();
    let retrieved_mutex = DETAIL_MUTEX.get_or_init(|| Mutex::new(HashMap::new()));
    retrieved_mutex.lock().unwrap()
}

#[utoipa::path(
    get,
    path = "/api/events/counts/daily",
    params(
        EventListQueryParams,
    ),
    tag = EVENTS_API_GROUP,
    responses(
        (status = 200, description = "List of convention days was successfully retrieved", body = DaysResponse),
        (status = 400, response = dto::err_resps::BasicError400Validation),
        (status = 500, response = dto::err_resps::BasicError500),
    )
)]
/// Lists the number of events by day for the current GenCon year
///
/// If filtering query parameters are supplied, the counts of events returned are the number
/// of events by day which match the query.
async fn list_event_counts_by_day(
    filter: &EventListQueryParams,
    _: &mut impl ExternalConnectivity,
) -> Result<Json<dto::DaysResponse>, ErrorResponse> {
    info!("Listing event counts across days.");
    filter.validate().map_err(ValidationErrorResponse)?;

    let mut event_data = event_data().clone();
    for (_, events_on_day) in event_data.events_by_day.iter_mut() {
        for block in events_on_day.iter_mut() {
            block.events.retain(|evt| matches_event_filter(evt, filter));
        }
    }

    let mut days: Vec<EventDay> = event_data
        .events_by_day
        .iter()
        .map(|(day_id, event_list)| {
            let total_events: u16 = event_list
                .iter()
                .map(|block| block.events.len() as u16)
                .sum();

            EventDay {
                day_id: *day_id,
                date: dto::DateDto::from_date_id(*day_id),
                total_events,
            }
        })
        .collect();
    days.sort_by(|day1, day2| day1.day_id.cmp(&day2.day_id));
    let dummy_resp_data = dto::DaysResponse { days };

    info!(
        "Retrieved event counts across {} days.",
        dummy_resp_data.days.len()
    );
    Ok(Json(dummy_resp_data))
}

#[utoipa::path(
    get,
    path = "/api/events/{event_id}",
    tag = EVENTS_API_GROUP,
    params(
        ("event_id" = u32, Path, description = "The ID of the event to look up"),
    ),
    responses(
        (status = 200, description = "Event successfully retrieved", body = EventDetailResponse),
        (
            status = 404,
            description = "No GenCon events exist with the given ID",
            body = BasicError,
            example = json!({
                "errorCode": "no_matching_event",
                "errorDescription": "The requested event was not found in the system.",
                "extraInfo": null
            }),
        ),
        (status = 500, response = dto::err_resps::BasicError500),
    ),
)]
/// Retrieve detailed information about a single GenCon event
async fn retrieve_event_detail(
    event_id: u32,
    _: &mut impl ExternalConnectivity,
) -> Result<Json<EventDetailResponse>, ErrorResponse> {
    info!("Getting details for event {event_id}.");
    // Find the event in the event blocks
    let evt_data = event_data();
    let mut retrieved_event: Option<(dto::DateDto, &EventSummary)> = None;

    'mainEvtLoop: for (day_id, event_list) in evt_data.events_by_day.iter() {
        for evt_block in event_list.iter() {
            let maybe_located_event = evt_block
                .events
                .iter()
                .find(|evt_summary| evt_summary.id == event_id);
            if let Some(located_event) = maybe_located_event {
                retrieved_event = Some((dto::DateDto::from_date_id(*day_id), located_event));
                break 'mainEvtLoop;
            }
        }
    }

    let evt_ref = match retrieved_event {
        Some(evt) => evt,
        None => {
            error!("Event with id {event_id} not found.");
            return Err((
                StatusCode::NOT_FOUND,
                Json(dto::BasicError {
                    error_code: "no_matching_event".to_owned(),
                    error_description: "There is no event in the system with the given ID."
                        .to_owned(),
                    extra_info: None,
                }),
            )
                .into());
        }
    };

    let mut event_cache = event_detail_cache();
    let event_to_return = match event_cache.get(&event_id) {
        Some(evt) => evt.clone(),
        None => {
            let newly_created_detail: EventDetailResponse = dto::DetailFromBlock {
                event_date: evt_ref.0 .0,
                summary: evt_ref.1,
                event_types: event_types(),
                event_locations: locations(),
                game_systems: game_systems(),
                organizer_groups: super::organizers::sample_organizer_groups(),
            }
            .fake();
            event_cache.insert(evt_ref.1.id, newly_created_detail.clone());
            newly_created_detail
        }
    };

    info!(
        "Retrieved event {event_id} ({}) successfully.",
        event_to_return.title
    );
    Ok(Json(event_to_return))
}

#[utoipa::path(
    get,
    path = "/api/events/locations",
    tag = EVENTS_API_GROUP,
    responses(
        (status = 200, description = "Successfully retrieved all known location buildings", body = Vec<LocationPart>),
        (status = 500, response = dto::err_resps::BasicError500),
    ),
)]
/// List the set of known buildings in the system
async fn retrieve_locations(
    _ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Json<Vec<dto::LocationPart>>, ErrorResponse> {
    info!("Retrieving locations.");
    let mut seen_ids: HashSet<u32> = HashSet::new();
    let unique_buildings: Vec<dto::LocationPart> = locations()
        .iter()
        .filter_map(|location| {
            let building = match location.building {
                Some(ref building) => building,
                None => return None,
            };
            if seen_ids.contains(&building.id) {
                return None;
            }

            seen_ids.insert(building.id);
            Some(building.clone())
        })
        .collect();

    info!("{} buildings retrieved.", unique_buildings.len());
    Ok(Json(unique_buildings))
}

#[utoipa::path(
    get,
    path = "/api/events/types",
    tag = EVENTS_API_GROUP,
    responses(
        (status = 200, description = "Successfully retrieved all known game types", body = Vec<EventType>),
        (status = 500, response = dto::err_resps::BasicError500),
    ),
)]
/// List the set of known game types in the system
async fn retrieve_event_types(
    _ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Json<Vec<dto::EventType>>, ErrorResponse> {
    info!("Retrieving known event types");
    let evt_types: Vec<dto::EventType> = event_types()
        .iter()
        .enumerate()
        .map(|(idx, evt_type)| dto::EventType {
            id: (idx + 1) as u32,
            type_name: evt_type.clone(),
        }).collect();
    
    info!("{} event types retrieved.", evt_types.len());
    Ok(Json(evt_types))
}

#[utoipa::path(
    get,
    path = "/api/events/game-systems",
    tag = EVENTS_API_GROUP,
    responses(
        (status = 200, description = "Successfully retrieved game systems", body = Vec<GameSystem>),
        (status = 500, response = dto::err_resps::BasicError500)
    )
)]
/// Lists known game systems in the current GenCon year
async fn retrieve_game_systems(
    _ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Json<&'static [GameSystem]>, ErrorResponse> {
    info!("Retrieving known game systems.");
    let systems = game_systems();

    info!("{} game systems retrieved.", systems.len());
    Ok(Json(systems))
}
