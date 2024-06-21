pub mod swagger_main;

pub mod days;
mod event_import;
pub mod events;
#[cfg(test)]
pub mod test_util;

struct PageRange {
    pub page_start: usize,
    pub page_end: usize,
}

fn determine_page_limits(page: u16, results_per_page: u16) -> PageRange {
    let page_start = (page as usize - 1) * results_per_page as usize;
    let page_end = page_start + results_per_page as usize;

    PageRange { page_start, page_end }
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

