# GenConCal Backend

The GenCon Calendar API is a Rust-based backend service for tracking GenCon events and schedules.

## Getting Started

1. Run `docker compose up` to start the PostgreSQL database and monitoring services (Grafana, Tempo, Prometheus).
2. Run `cargo run` to start the GenConCal backend service.

The service will be available at `http://localhost:8080`.

## Useful Links

When running the full stack with `docker compose up`, the following interfaces are available:

* **API Documentation**: [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui) - Interactive OpenAPI documentation
* **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) - Monitoring, metrics, and observability

## API Documentation

The Swagger UI (provided by the [utoipa](https://github.com/juhaku/utoipa) crate) can be accessed at http://localhost:8080/swagger-ui when starting the application.

## Tests

Unit tests for both API routers and business logic can be run via `cargo test`.

## Integration tests

Provided on this repo is a framework for integration testing. By default, the integration tests are skipped via the `#[cfg_attr()]` declaration which requires the `integration_test` feature to be enabled.

To run the tests with the integration tests, run the following:

```bash
# Create a postgres database to test against
docker-compose up -d
# Run all tests, including integration tests
cargo test --features integration_test
```

More information on integration testing can be found in the [testing documentation](./doc/testing.md#writing-integration-tests).
