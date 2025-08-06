use serde::Deserialize;
use tracing::*;
use utoipa::IntoParams;
use validator::Validate;

pub mod swagger_main;

pub mod cors;
pub mod days;
pub mod event_import;
pub mod events;
pub mod organizers;
#[cfg(test)]
pub mod test_util;

struct PageRange {
    pub page_start: usize,
    pub page_end: usize,
}

#[instrument]
/// Calculates the start and end indices of a set of results based on
/// the requested page and the number of results per page
fn determine_page_limits(page: u16, results_per_page: u16) -> PageRange {
    let page_start = (page as usize - 1) * results_per_page as usize;
    let page_end = page_start + results_per_page as usize;

    PageRange {
        page_start,
        page_end,
    }
}

#[instrument]
fn total_pages(results_per_page: u16, total_results: usize) -> u16 {
    let rpp_usize = results_per_page as usize;
    let pages = if total_results % rpp_usize != 0 {
        total_results / rpp_usize + 1
    } else {
        total_results / rpp_usize
    };

    pages as u16
}

#[derive(Validate, Debug, Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
#[serde(rename_all = "kebab-case")]
pub struct PaginationQueryParams {
    #[validate(range(min = 1))]
    /// The page of results to return (default 1)
    pub page: Option<u16>,

    #[validate(range(min = 1))]
    /// The number of results to return per page
    pub limit: Option<u16>,
}

static MEBIBYTE: usize = 1024 * 1024;
