use axum::http::Method;
use tower_http::cors::{Any, CorsLayer};
pub fn cors_config() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
}