use serde::Deserialize;
use utoipa::IntoParams;
use validator::Validate;

pub mod swagger_main;

pub mod days;
mod event_import;
pub mod events;
#[cfg(test)]
pub mod test_util;
pub mod organizers;

struct PageRange {
    pub page_start: usize,
    pub page_end: usize,
}

fn determine_page_limits(page: u16, results_per_page: u16) -> PageRange {
    let page_start = (page as usize - 1) * results_per_page as usize;
    let page_end = page_start + results_per_page as usize;

    PageRange {
        page_start,
        page_end,
    }
}

fn total_pages(results_per_page: u16, total_results: usize) -> u16 {
    let rpp_usize = results_per_page as usize;
    let pages = if total_results % rpp_usize != 0 {
        total_results / rpp_usize + 1
    } else {
        total_results / rpp_usize
    };

    pages as u16
}

#[derive(Validate, Deserialize, IntoParams)]
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
