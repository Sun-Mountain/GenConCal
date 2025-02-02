pub mod event;
pub mod game_master;
pub mod location;
pub mod metadata;
#[cfg(test)]
mod test_util;
pub mod tournament;

/// Alias for the result of a "bulk read" operation
type BulkLookupResult<T, E> = Result<Vec<Option<T>>, E>;
