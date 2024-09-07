use crate::external_connections::ExternalConnectivity;
use crate::routing_utils::Json;
use crate::{dto, AppState, SharedData};
use axum::extract::State;
use axum::response::ErrorResponse;
use axum::routing::get;
use axum::Router;
use fake::{Fake, Faker};
use tracing::*;
use std::sync::{Arc, OnceLock};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(list_organizer_groups))]
pub struct OrganizersApi;

pub const ORGANIZERS_API_GROUP: &str = "Organizers";

pub fn organizers_routes() -> Router<Arc<SharedData>> {
    Router::new().route(
        "/groups",
        get(|State(app_data): AppState| async move {
            let mut ext_cxn = app_data.ext_cxn.clone();

            list_organizer_groups(&mut ext_cxn).await
        }),
    )
}

pub(super) fn sample_organizer_groups() -> &'static [dto::Group] {
    static ORGANIZER_GROUPS: OnceLock<[dto::Group; 5]> = OnceLock::new();
    let groups_ref = ORGANIZER_GROUPS.get_or_init(|| {
        info_span!("generating_groups", total_groups = 5).in_scope(|| {
            [
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
                Faker.fake(),
            ]
        })
    });

    groups_ref
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
