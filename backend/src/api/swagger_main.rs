use crate::dto;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(info(
    title = "GenCon Event Calendar API",
    description = "An API for effectively searching events at GenCon"
))]
struct TodoApi;

/// Constructs the route on the API that renders the swagger UI and returns the OpenAPI schema.
/// Merges in OpenAPI definitions from other locations in the app, such as the [dto] package
/// and submodules of [api][crate::api]
pub fn build_documentation() -> SwaggerUi {
    let mut api_docs = TodoApi::openapi();
    api_docs.merge(dto::OpenApiSchemas::openapi());
    api_docs.merge(super::days::DaysApi::openapi());
    api_docs.merge(super::events::EventsApi::openapi());
    api_docs.merge(super::organizers::OrganizersApi::openapi());

    SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api_docs)
}
