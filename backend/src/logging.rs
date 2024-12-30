use opentelemetry::trace::TracerProvider;
use opentelemetry::KeyValue;
use opentelemetry_otlp::{MetricExporter, SpanExporter, WithExportConfig};
use opentelemetry_sdk::metrics::{PeriodicReader, SdkMeterProvider};
use opentelemetry_sdk::trace::Tracer;
use opentelemetry_sdk::{runtime, Resource};
use tracing::level_filters::LevelFilter;
use tracing_opentelemetry::{MetricsLayer, OpenTelemetryLayer};
use tracing_subscriber::{prelude::*, registry, EnvFilter};

pub struct OtelExporters {
    pub tracer: Tracer,
    pub meter: SdkMeterProvider,
}

pub fn init_exporters(otlp_traces_endpoint: &str, otlp_metrics_endpoint: &str) -> OtelExporters {
    let span_export = SpanExporter::builder()
        .with_tonic()
        .with_endpoint(otlp_traces_endpoint)
        .build()
        .expect("failed to build span exporter");
    let meter_export = MetricExporter::builder()
        .with_tonic()
        .with_endpoint(otlp_metrics_endpoint)
        .build()
        .expect("failed to build meter exporter");
    
    let metrics_reader = PeriodicReader::builder(meter_export, runtime::Tokio)
        .build();
    
    let trace_provider = opentelemetry_sdk::trace::TracerProvider::builder()
        .with_batch_exporter(span_export, runtime::Tokio)
        .with_resource(Resource::new([KeyValue::new("service.name", "genconcal_backend")]))
        .build()
        .tracer("genconcal_backend");
    let meter_provider = SdkMeterProvider::builder()
        .with_reader(metrics_reader)
        .with_resource(Resource::new([KeyValue::new("service.name", "genconcal_backend")]))
        .build();

    OtelExporters {
        tracer: trace_provider,
        meter: meter_provider,
    }
}

pub fn init_env_filter() -> EnvFilter {
    EnvFilter::builder()
        .with_default_directive(LevelFilter::INFO.into())
        .with_env_var("LOG_FILTERS")
        .from_env()
        .expect("building the logging filter failed")
}

pub fn setup_logging_and_tracing(env_filter: EnvFilter, otel_exporters: Option<OtelExporters>) {
    if let Some(exporters) = otel_exporters {
        registry()
            .with(OpenTelemetryLayer::new(exporters.tracer))
            .with(MetricsLayer::new(exporters.meter))
            .with(tracing_subscriber::fmt::layer().json().with_filter(env_filter))
            .init();
    } else {
        registry()
            .with(tracing_subscriber::fmt::layer().json().with_filter(env_filter))
            .init();
    }
}