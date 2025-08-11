use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::Json;
use crate::{AppState, SharedData, dto};
use axum::Router;
use axum::extract::State;
use axum::response::ErrorResponse;
use axum::routing::get;
use fake::{Fake, Faker};
use std::sync::{Arc, OnceLock};
use tracing::*;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(list_organizer_groups))]
/// OpenAPI struct which registers organizer-related documentation with Swagger
pub struct OrganizersApi;

/// Constant which defines the "organizers" group of API endpoints
pub const ORGANIZERS_API_GROUP: &str = "Organizers";

/// Returns a router containing all routes for the "/api/organizers" endpoints
pub fn organizers_routes() -> Router<Arc<SharedData>> {
    Router::new().route(
        "/groups",
        get(async |State(app_data): AppState| {
            let mut ext_cxn = app_data.ext_cxn.clone();

            list_organizer_groups(&mut ext_cxn).await
        }),
    )
}

/// Generates a deterministic set of sample organizer groups for stubbed APIs and caches them
pub(super) fn sample_organizer_groups() -> &'static [dto::Group] {
    static ORGANIZER_GROUPS: OnceLock<[dto::Group; 5]> = OnceLock::new();
    ORGANIZER_GROUPS.get_or_init(|| {
        info_span!("generating_groups", total_groups = 5).in_scope(|| {
            [
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
            ]
        })
    })
}

#[utoipa::path(
    get,
    path = "/api/organizers/groups",
    tag = ORGANIZERS_API_GROUP,
    responses(
        (status = 200, description = "Organizers successfully retrieved", body = [Group]),
        (status = 500, response = dto::err_resps::BasicError500),
    )
)]
#[instrument(skip(_ext_cxn))]
/// List known organizing groups for the current GenCon year
async fn list_organizer_groups(
    _ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Json<&'static [dto::Group]>, ErrorResponse> {
    Ok(Json(sample_organizer_groups()))
}
