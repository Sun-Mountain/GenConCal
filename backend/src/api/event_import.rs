use crate::dto::IngestEventConvertErr;
use crate::external_connections::{with_transaction, ExternalConnectivity, TransactableExternalConnectivity};
use crate::{domain, dto, persistence, AppState, SharedData};
use axum::http::StatusCode;
use axum::response::ErrorResponse;
use axum::{Json, Router};
use std::sync::Arc;
use anyhow::anyhow;
use axum::extract::State;
use axum::routing::post;
use tracing::error;
use utoipa::OpenApi;
use crate::routing_utils::GenericErrorResponse;

#[derive(OpenApi)]
#[openapi()]
pub struct EventImport;

pub const EVENT_IMPORT_GROUP: &str = "EventImport";

pub fn event_import_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route("/", post(|State(app_state): AppState, Json(import_request): Json<dto::EventImportRequest>| async move {
            let evt_svc = domain::event::EventService;
            let mut ext_cxn = app_state.ext_cxn.clone();
            
            import_events(import_request, &evt_svc, &mut ext_cxn).await
        }))
}

async fn import_events(
    import_request: dto::EventImportRequest,
    event_port: &impl domain::event::driving_ports::EventPort,
    ext_cxn: &mut impl TransactableExternalConnectivity,
) -> Result<StatusCode, ErrorResponse> {
    let mut ingest_vec: Vec<domain::event::IngestEvent>= Vec::with_capacity(import_request.event_data.len());
    
    for (evt_idx, import_evt) in import_request.event_data.into_iter().enumerate() {
        let conversion_result = domain::event::IngestEvent::try_from(import_evt);

        match conversion_result {
            Err(event_convert_err) => {
                return match event_convert_err {
                    IngestEventConvertErr::BadEndTime => Err((StatusCode::BAD_REQUEST, Json(dto::BasicError {
                        error_code: "bad_end_time".to_string(),
                        error_description: format!("Could not parse the end time of the event at index {evt_idx}."),
                        extra_info: None,
                    })).into()),

                    IngestEventConvertErr::BadStartTime => Err((StatusCode::BAD_REQUEST, Json(dto::BasicError {
                        error_code: "bad_start_time".to_string(),
                        error_description: format!("Could not parse the start time of the event at index {evt_idx}."),
                        extra_info: None,
                    })).into()),

                    IngestEventConvertErr::UnrecognizedAgeRequirement(bad_age) => Err((StatusCode::BAD_REQUEST, Json(dto::BasicError {
                        error_code: "bad_age_requirement".to_string(),
                        error_description: format!("Could not parse the age requirement of the event at index {evt_idx}: {bad_age}"),
                        extra_info: None,
                    })).into()),

                    IngestEventConvertErr::UnrecognizedExperience(bad_exp) => Err((StatusCode::BAD_REQUEST, Json(dto::BasicError {
                        error_code: "bad_experience_requirement".to_string(),
                        error_description: format!("Could not parse the experience level of the event at index {evt_idx}: {bad_exp}"),
                        extra_info: None,
                    })).into()),
                }
            }
            Ok(converted_event) => ingest_vec.push(converted_event),
        }
    }

    with_transaction(ext_cxn, async move |tx_handle| {
        event_port.import_events(
            &ingest_vec, 
            
            &persistence::metadata::DbEventTypeSaver,
            &persistence::metadata::DbGameSystemSaver,
            &persistence::metadata::DbContactSaver,
            &persistence::metadata::DbGroupSaver,
            &persistence::metadata::DbWebsiteSaver,
            &persistence::metadata::DbMaterialsSaver,
            
            &persistence::location::DbLocationReader,
            &persistence::location::DbLocationWriter,
            
            &persistence::event::DbEventDetector,
            &persistence::event::DbEventWriter,
            
            tx_handle,
        ).await
    }).await
        .map_err(|err| {
            error!("Event import failed: {}", err);
            GenericErrorResponse(anyhow!("Could not import events."))
        })?;
    
    Ok(StatusCode::CREATED)
}
