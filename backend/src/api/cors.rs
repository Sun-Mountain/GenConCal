use axum::http::Method;
use tower_http::cors::{Any, CorsLayer};

/// Produces a common CORS configuration which allows any origin to perform any
/// method on the public API
pub fn cors_config() -> CorsLayer {
    CorsLayer::new().allow_origin(Any).allow_methods([
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::DELETE,
        Method::OPTIONS,
    ])
}
