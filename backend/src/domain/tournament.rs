use crate::domain::event::FullEvent;
use chrono_tz::Tz;
#[cfg(test)]
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug)]
/// Lightweight view of an event used when assembling tournaments
pub struct EventSummary<'evt> {
    #[expect(dead_code)]
    pub id: i32,
    pub title: &'evt str,
    pub start_time: chrono::DateTime<Tz>,
}

#[derive(Debug)]
/// Input representing a single tournament-related event used for detection
pub struct RawTournamentIngest<'evt> {
    event_info: EventSummary<'evt>,
    round_info: RoundInfoIngest,
}

/// Represents a tournament composed of one or more rounds
#[expect(dead_code)]
pub struct Tournament {
    pub id: i32,
    pub name: String,
    pub total_rounds: u8,
}

/// A single round of a tournament with its member events
#[expect(dead_code)]
pub struct TournamentSegment {
    pub round: u8,
    pub segment_events: Vec<FullEvent>,
}

/// A segment reference storing event IDs instead of full events
#[expect(dead_code)]
pub struct TournamentSegmentRef {
    pub round: u8,
    pub segment_events: Vec<i32>,
}

#[derive(Debug)]
/// Round metadata for a tournament event (current and total rounds)
pub struct RoundInfoIngest {
    pub round: u8,
    pub total_rounds: u8,
}

#[derive(Debug)]
/// A detected tournament with overall metadata and grouped segments by round.
pub struct TournamentIngest<'evt> {
    #[expect(dead_code)]
    pub total_rounds: u8,
    #[expect(dead_code)]
    pub name: &'evt str,
    #[expect(dead_code)]
    pub segment_events: Vec<TournamentSegmentIngest<'evt>>,
}

#[derive(Debug)]
#[expect(dead_code)]
/// A tournament segment containing all events that belong to a particular round.
pub struct TournamentSegmentIngest<'evt> {
    pub round: u8,
    pub round_members: Vec<&'evt EventSummary<'evt>>,
}

pub mod driven_ports {}

#[expect(dead_code)]
/// Looks through the set of events in an event ingest and attempts to assemble tournaments
/// based on similarly named events
pub fn detect_tournaments<'evt>(
    events: &'evt [RawTournamentIngest],
) -> Vec<TournamentIngest<'evt>> {
    // Get the set of events that are actually part of a tournament
    let (single_event_tourney, multi_event_tourney): (
        Vec<&RawTournamentIngest>,
        Vec<&RawTournamentIngest>,
    ) = events
        .iter()
        .partition(|evt| evt.round_info.total_rounds == 1);

    let mut tournaments: Vec<TournamentIngest<'_>> = Vec::new();

    // Tournaments with only one round can be converted directly into a standalone tournament
    for event in single_event_tourney.into_iter() {
        tournaments.push(TournamentIngest {
            total_rounds: 1,
            name: event.event_info.title,
            segment_events: vec![TournamentSegmentIngest {
                round: 1,
                round_members: vec![&event.event_info],
            }],
        })
    }

    // For multi-round tournaments, we need to find events with the same title prefix and the same number of rounds
    // to consider them as part of the same tournament
    let mut events_by_rounds: HashMap<u8, Vec<&'evt RawTournamentIngest>> = HashMap::new();
    for event in multi_event_tourney.into_iter() {
        let tournament_length_vec = events_by_rounds
            .entry(event.round_info.total_rounds)
            .or_default();
        tournament_length_vec.push(event);
    }

    #[derive(Debug)]
    struct SanitizedTitleEvent<'evt> {
        sanitized_title: String,
        removed_indices: Vec<usize>,
        event: &'evt RawTournamentIngest<'evt>,
    }

    #[derive(Clone, Debug)]
    struct PrefixGroup<'san, 'evt> {
        prefix_size: Option<usize>,
        group_entries: Vec<&'san SanitizedTitleEvent<'evt>>,
    }

    // Next, we sanitize the titles of each event to account for punctuation differences and attempt
    // to match events together based on common shared prefixes. After doing that, we can throw events
    // with the same round number into the same tournament segment for every prefix group
    for (round_total, event_list) in events_by_rounds.iter() {
        // Sanitize event titles and then sort by those sanitized titles
        let mut events_by_sanitized_title: Vec<SanitizedTitleEvent> = event_list
            .iter()
            .map(|evt| {
                let sanitized_title = sanitize_title(evt.event_info.title);
                SanitizedTitleEvent {
                    sanitized_title: sanitized_title.new_title,
                    removed_indices: sanitized_title.removed_indices,
                    event: evt,
                }
            })
            .collect();
        events_by_sanitized_title
            .sort_by(|title1, title2| title1.sanitized_title.cmp(&title2.sanitized_title));

        // Group events together by common title prefixes
        let mut tournament_groups: Vec<PrefixGroup<'_, '_>> = vec![PrefixGroup {
            prefix_size: None,
            group_entries: vec![&events_by_sanitized_title[0]],
        }];

        for event_window in events_by_sanitized_title.windows(2) {
            let previous_event = &event_window[0];
            let current_event = &event_window[1];

            let current_group = tournament_groups
                .last_mut()
                .expect("There should always be at least one group");
            let common_prefix_len = common_prefix_length(
                &previous_event.sanitized_title,
                &current_event.sanitized_title,
            );

            // If we know the size of the common prefix in this group...
            if let Some(last_group_prefix_size) = current_group.prefix_size {
                // ...and the previous and current titles match perfectly...
                if previous_event.sanitized_title == current_event.sanitized_title ||
                    // ...or the matching prefix has the same length as that of the current group...
                    common_prefix_len == last_group_prefix_size ||
                    // ...or the matching prefix is longer than that of the current group, and both share that prefix
                    (common_prefix_len > last_group_prefix_size &&
                        previous_event.sanitized_title[0..last_group_prefix_size] == current_event.sanitized_title[0..last_group_prefix_size]
                    )
                {
                    // ...just add it to the current group
                    current_group.group_entries.push(current_event);
                // ...and the matching prefix isn't the same length as that of the group...
                } else {
                    // ...create a new group and add the current event to it
                    let new_group = PrefixGroup {
                        prefix_size: None,
                        group_entries: vec![current_event],
                    };

                    tournament_groups.push(new_group);
                }
            // If we don't know the size of the common prefix in the group...
            } else {
                // ...and the previous event has the same title as the current event...
                if previous_event.sanitized_title == current_event.sanitized_title {
                    // ...add it to this group, but the common prefix size is still unknown
                    current_group.group_entries.push(current_event);
                // ...and they share no characters...
                } else if common_prefix_len == 0 {
                    // ...add it to a new group
                    let new_group = PrefixGroup {
                        prefix_size: None,
                        group_entries: vec![current_event],
                    };
                    tournament_groups.push(new_group);
                // ...and they share a nonzero number of characters...
                } else {
                    // ...add it to the current group and set the common prefix size
                    current_group.prefix_size = Some(common_prefix_len);
                    current_group.group_entries.push(current_event);
                }
            }
        }

        for mut pfx_group in tournament_groups.into_iter() {
            pfx_group.group_entries.sort_by(|evt1, evt2| {
                evt1.event
                    .event_info
                    .start_time
                    .cmp(&evt2.event.event_info.start_time)
            });

            let initial_entry = *pfx_group
                .group_entries
                .first()
                .expect("There must be at least one event in the group");
            let unsanitized_prefix_len = match pfx_group.prefix_size {
                None => initial_entry.event.event_info.title.len(),

                // To get the true prefix length, we have to add one extra character for every
                // removed character from the original string as long as it was before the
                // end index of the sanitized prefix
                //
                // You can look at it like this. If every dot in this example is a character
                // carried over into the sanitized prefix and every x is a removed character,
                // here are how the indices work between the original string and the sanitized
                // string:
                //                         Common Prefix
                //                              v
                // Original:  0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17
                //            . . . x . . x x . . .  x  .  .  x  .  .  .
                // Sanitized: 0 1 2   3 4     5 6 7     8  9     10 11 12
                //
                // Removed indices: [3, 6, 7, 11, 14]
                //
                // Notice that in the sanitized string, the common prefix length is 6. To figure
                // out the true prefix length in the original string, we need to go through the
                // removed indices and keep adding 1 to the common prefix length as long as the
                // removed index is not higher than it.
                //
                // With that logic, we can see removed indices 3, 6, and 7 would all be lower
                // than the prefix length during the addition process, which brings us back to
                // the true index length of 9 in the original string.
                Some(mut san_pfx_len) => {
                    for skipped_character_idx in initial_entry.removed_indices.iter() {
                        if *skipped_character_idx > san_pfx_len {
                            break;
                        }

                        san_pfx_len += 1
                    }

                    san_pfx_len
                }
            };

            // It turns out semifinals can happen in between qualifier rounds, so we'll just grug-brain
            // this and put events into segments based on round number
            let mut tournament_segments: Vec<TournamentSegmentIngest> = (1..=(*round_total))
                .map(|round_num| TournamentSegmentIngest {
                    round: round_num,
                    round_members: Vec::new(),
                })
                .collect();

            for tournament_event in pfx_group.group_entries.iter() {
                let event_round = tournament_event.event.round_info.round;

                tournament_segments[(event_round - 1) as usize]
                    .round_members
                    .push(&tournament_event.event.event_info);
            }

            let tournament_title = &initial_entry.event.event_info.title[0..unsanitized_prefix_len];
            tournaments.push(TournamentIngest {
                total_rounds: *round_total,
                name: trim_punc_and_spaces(tournament_title),
                segment_events: tournament_segments
                    .into_iter()
                    .filter(|segment| !segment.round_members.is_empty())
                    .collect(),
            });
        }
    }

    tournaments
}

/// Returns the number of characters at the beginning of two strings that match
fn common_prefix_length(str1: &str, str2: &str) -> usize {
    let mut prefix_length = 0;
    let character_iterator = str1.chars().zip(str2.chars());

    // We want at least one whole word to match, so keep track of whether we see a space
    let mut space_seen = false;

    for (char1, char2) in character_iterator {
        if char1 != char2 {
            break;
        }
        if char1 == ' ' {
            space_seen = true
        }

        prefix_length += 1;
    }

    if space_seen { prefix_length } else { 0 }
}

/// Result of sanitizing a title: lowercase, punctuation-stripped text plus indices removed from the original string.
struct SanitizedTitle {
    new_title: String,
    removed_indices: Vec<usize>,
}

/// Lowercases and removes punctuation from a string, reporting
/// the indices of characters removed from the original string
fn sanitize_title(title: &str) -> SanitizedTitle {
    let mut new_title = String::new();
    let mut removed_indices: Vec<usize> = Vec::new();
    let mut last_was_punctuation = false;

    for (index, char) in title.char_indices() {
        match char {
            '0'..='9' | 'a'..='z' => new_title.push(char),
            'A'..='Z' => new_title.push(char.to_ascii_lowercase()),
            ' ' => {
                if last_was_punctuation {
                    removed_indices.push(index);
                } else {
                    new_title.push(' ');
                }
            }

            _ => {
                last_was_punctuation = true;
                removed_indices.push(index);
                continue;
            }
        }

        last_was_punctuation = false;
    }

    SanitizedTitle {
        new_title,
        removed_indices,
    }
}

/// Trims both whitespace and punctuation from either end
/// of a string
fn trim_punc_and_spaces(value: &str) -> &str {
    if value.is_empty() {
        return value;
    }

    let mut slice_begin: usize = 0;
    let mut slice_end = value.len();

    let chars_iterator = value.chars();
    for char in chars_iterator {
        if let 'a'..='z' | 'A'..='Z' | '0'..='9' = char {
            break;
        }

        slice_begin += 1;
    }

    let chars_rev_iterator = value.chars().rev();
    for char in chars_rev_iterator {
        if let 'a'..='z' | 'A'..='Z' | '0'..='9' = char {
            break;
        }

        slice_end -= 1;
    }

    if slice_begin >= slice_end {
        &value[0..0]
    } else {
        &value[slice_begin..slice_end]
    }
}

#[cfg(test)]
mod tests {
    use std::fs::File;
    use std::io::{BufReader, BufWriter};

    use crate::dto;

    use super::*;

    // TODO write unit tests for tournament detection
}
