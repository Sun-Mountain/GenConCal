use std::collections::HashMap;
use crate::domain::event;
use crate::domain::event::FullEvent;

pub struct Tournament {
    pub id: i32,
    pub name: String,
    pub total_rounds: u8,
}

pub struct TournamentSegment {
    pub round: u8,
    pub segment_events: Vec<FullEvent>,
}

pub struct RoundInfoIngest {
    pub round: u8,
    pub total_rounds: u8,
}

pub struct TournamentIngest<'evt> {
    pub total_rounds: u8,
    pub name: &'evt str,
    pub segment_events: Vec<TournamentSegmentIngest<'evt>>,
}

pub struct TournamentSegmentIngest<'evt> {
    pub round: u8,
    pub round_members: Vec<&'evt event::IngestEvent>,
}

pub fn detect_tournaments<'evt>(events: &'evt [event::IngestEvent]) -> Vec<TournamentIngest<'evt>> {
    // Get the set of events that are actually part of a tournament
    let (single_event_tourney, multi_event_tourney): (Vec<&event::IngestEvent>, Vec<&event::IngestEvent>) =
        events
            .iter()
            .filter(|evt| {
                matches!(evt, event::IngestEvent { tournament: Some(_), ..})
            }).partition(|evt| evt.tournament.as_ref().unwrap().total_rounds == 1);

    let mut tournaments: Vec<TournamentIngest<'evt>> =  Vec::new();

    // Tournaments with only one round can be converted directly into a standalone tournament
    for event in single_event_tourney.into_iter() {
        tournaments.push(TournamentIngest {
            total_rounds: 1,
            name: event.title.as_str(),
            segment_events: vec![
                TournamentSegmentIngest {
                    round: 1,
                    round_members: vec![event]
                }
            ]
        })
    }

    // For multi-round tournaments, we need to find events with the same title prefix and the same number of rounds
    // to consider them as part of the same tournament
    let mut events_by_rounds: HashMap<u8, Vec<&'evt event::IngestEvent>> = HashMap::new();
    for event in multi_event_tourney.into_iter() {
        let tournament_length_vec = events_by_rounds
            .entry(event.tournament.as_ref().unwrap().total_rounds)
            .or_default();
        tournament_length_vec.push(event);
    }

    struct SanitizedTitleEvent<'evt> {
        sanitized_title: String,
        removed_indices: Vec<usize>,
        event: &'evt event::IngestEvent,
    }
    
    struct PrefixGroup<'evt> {
        prefix_size: Option<usize>,
        group_entries: Vec<&'evt SanitizedTitleEvent<'evt>>,
    }

    // Next, we sanitize the titles of each event to account for punctuation differences and attempt
    // to match events together based on common shared prefixes. After doing that, we can sort the events
    // by time. Any time the round number goes down, we start a new tournament. Otherwise, consecutive events
    // with a common prefix are considered to be part of the same tournament.
    for (round_total, event_list) in events_by_rounds.iter() {
        // Sanitize event titles and then sort by those sanitized titles
        let mut events_by_sanitized_title: Vec<SanitizedTitleEvent> = event_list.iter().map(|evt| {
            let sanitized_title = sanitize_title(&evt.title);
            SanitizedTitleEvent {
                sanitized_title: sanitized_title.new_title,
                removed_indices: sanitized_title.removed_indices,
                event: *evt,
            }
        }).collect();
        events_by_sanitized_title.sort_by(|title1, title2| title1.sanitized_title.cmp(&title2.sanitized_title));

        // Group events together by common title prefixes
        let mut tournament_groups: Vec<PrefixGroup<'evt>> = vec![PrefixGroup {
            prefix_size: None,
            group_entries: vec![&events_by_sanitized_title[0]],
        }];
        
        for [previous_event, current_event] in events_by_sanitized_title.windows(2) {
            let current_group = tournament_groups.last_mut().expect("There should always be at least one group");
            let common_prefix_len = common_prefix_length(&previous_event.sanitized_title, &current_event.sanitized_title);
            
            // If we know the size of the common prefix in this group...
            if let Some(last_group_prefix_size) = current_group.prefix_size {
                // ...and the previous and current titles match perfectly...
                if previous_event.sanitized_title == current_event.sanitized_title {
                    // ...just add it to the current group
                    current_group.group_entries.push(current_event);
                // ...and the matching prefix has the same length as that of the current group...
                } else if common_prefix_len == last_group_prefix_size {
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
                } else if common_prefix_len != 0 {
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
        
        // TODO sort the prefix groups by time and segment them by increasing round number
    }


    Vec::new()
}

fn common_prefix_length(str1: &str, str2: &str) -> usize {
    let mut prefix_length = 0;
    let mut character_iterator = str1.chars().zip(str2.chars());
    
    while let Some((char1, char2)) = character_iterator.next() {
        if char1 != char2 {
            break
        }
        
        prefix_length += 1;
    }
    
    prefix_length
}

struct SanitizedTitle {
    new_title: String,
    removed_indices: Vec<usize>,
}

fn sanitize_title(title: &str) -> SanitizedTitle {
    let mut new_title = String::new();
    let mut removed_indices: Vec<usize> = Vec::new();
    let mut last_was_punctuation = false;

    for (index, char) in title.char_indices() {
        match char {
            'a'..='z' => new_title.push(char),
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
