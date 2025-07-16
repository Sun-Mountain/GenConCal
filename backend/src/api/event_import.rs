use crate::dto::IngestEventConvertErr;
use crate::external_connections::{with_transaction, ExternalConnectivity, TransactableExternalConnectivity, TxOrSourceError};
use crate::{domain, dto, persistence, AppState, SharedData};
use axum::http::StatusCode;
use axum::response::ErrorResponse;
use axum::{Json, Router};
use std::sync::Arc;
use anyhow::anyhow;
use axum::extract::{DefaultBodyLimit, State};
use axum::routing::post;
use tracing::*;
use utoipa::OpenApi;
use crate::api::MEBIBYTE;
use crate::routing_utils::GenericErrorResponse;

#[derive(OpenApi)]
#[openapi(paths(
    import_events,
))]
pub struct EventImportApi;

pub const EVENT_IMPORT_GROUP: &str = "EventImport";

pub fn event_import_routes() -> Router<Arc<SharedData>> {
    Router::new()
        .route("/", post(|State(app_state): AppState, Json(import_request): Json<dto::EventImportRequest>| async move {
            let evt_svc = domain::event::EventService;
            let mut ext_cxn = app_state.ext_cxn.clone();
            
            import_events(import_request, &evt_svc, &mut ext_cxn).await
        })).layer(DefaultBodyLimit::max(50 * MEBIBYTE))
}

#[utoipa::path(
    post,
    path = "/api/data-ingests",
    tag = EVENT_IMPORT_GROUP,
    request_body = EventImportRequest,
    responses(
        (status = 201, description = "Events successfully upserted."),
        (
            status = 400,
            description = "Event had bad start time",
            body = BasicError,
            examples(
                ("Bad start time" = (
                    summary = "Malformed start time in an event (error_code: bad_start_time)",
                    value = json!({
                        "errorCode": "bad_start_time",
                        "errorDescription": "Could not parse the start time of the event at index 0.",
                        "extraInfo": null
                    }))
                ),
                ("Bad end time" = (
                    summary = "Malformed end time in an event (error_code: bad_end_time)",
                    value = json!({
                        "errorCode": "bad_end_time",
                        "errorDescription": "Could not parse the end time of the event at index 0.",
                        "extraInfo": null
                    }))
                ),
                ("Bad age requirement" = (
                    summary = "Malformed age requirement in an event (error_code: bad_age_requirement)",
                    value = json!({
                       "errorCode": "bad_age_requirement",
                       "errorDescription": "Could not parse the age requirement of the event at index 0: gobbledygook",
                       "extraInfo": null
                   }))
                ),
               ("Bad experience requirement" = (
                    summary = "Malformed experience requirement in an event (error_code: bad_experience_requirement)",
                    value = json!({
                        "errorCode": "bad_experience_requirement",
                        "errorDescription": "Could not parse the experience level of the event at index 5: whatchamacallit",
                        "extraInfo": null
                   }))
                ),
           )
        ),
        (status = 500, response = dto::err_resps::BasicError500),
    )
)]
#[tracing::instrument(skip_all, fields(total_events = import_request.event_data.len()))]
async fn import_events(
    import_request: dto::EventImportRequest,
    event_port: &impl domain::event::driving_ports::EventPort,
    ext_cxn: &mut impl TransactableExternalConnectivity,
) -> Result<StatusCode, ErrorResponse> {
    let mut ingest_vec: Vec<domain::event::IngestEvent>= Vec::with_capacity(import_request.event_data.len());

    {
        let conv_span = debug_span!("DTO Conversion");
        let _entered_span = conv_span.enter();
        
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
    }

    with_transaction(ext_cxn, async |txn| {
        event_port.import_events(
            &ingest_vec,

            &persistence::metadata::DbEventTypeSaver,
            &persistence::metadata::DbGameSystemSaver,
            &persistence::metadata::DbContactSaver,
            &persistence::metadata::DbGroupSaver,
            &persistence::metadata::DbWebsiteSaver,
            &persistence::metadata::DbMaterialsSaver,

            &persistence::game_master::GameMasterDbSaver,

            &persistence::location::DbLocationReader,
            &persistence::location::DbLocationWriter,

            &persistence::game_master::GameMasterDbAssociator,

            &persistence::event::DbEventDetector,
            &persistence::event::DbEventWriter,

            txn,
        ).await
    }).await.map_err(|txn_err: TxOrSourceError<Vec<i64>, anyhow::Error>| {
        match txn_err {
            TxOrSourceError::Source(src_err) => error!(?src_err, "Import failure - logic issue"),
            TxOrSourceError::TxBegin(tx_err) => error!("Import failure - failed to start database transaction: {tx_err}"),
            TxOrSourceError::TxCommit { successful_result, transaction_err} =>
                error!(
                    "Import failure - successfully ingested {num_events} events but failed to commit the transaction: {transaction_err}",
                    num_events=successful_result.len()
                ),
        }

        GenericErrorResponse(anyhow!("Could not import events."))
    })?;

    Ok(StatusCode::CREATED)
}
