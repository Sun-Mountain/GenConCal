use crate::dto::IngestEventConvertErr;
use crate::external_connections::ExternalConnectivity;
use crate::{domain, dto, SharedData};
use axum::http::StatusCode;
use axum::response::ErrorResponse;
use axum::Router;
use std::sync::Arc;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi()]
pub struct EventImport;

pub const EVENT_IMPORT_GROUP: &str = "EventImport";

pub fn event_import_routes() -> Router<Arc<SharedData>> {
    Router::new()
}

async fn import_events(
    import_request: dto::EventImportRequest,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<StatusCode, ErrorResponse> {
    let ingest_vec: Result<Vec<domain::event::IngestEvent>, IngestEventConvertErr> = import_request
        .event_data
        .into_iter()
        .map(domain::event::IngestEvent::try_from)
        .collect();
    Ok(StatusCode::CREATED)
}
