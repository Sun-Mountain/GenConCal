use crate::domain::location::driven_ports::{LocationReader, LocationWriter};
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;
#[cfg(test)]
use serde::Serialize;
use std::collections::HashMap;
use derive_more::Display;

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Location {
    pub id: i32,
    pub name: String,
    pub room: Option<Room>,
}

impl Location {
    pub fn as_location_ref(&self) -> Ref {
        match self {
            Location {
                room:
                    Some(Room {
                        section: Some(Section { id, .. }),
                        ..
                    }),
                ..
            } => Ref {
                id: *id,
                ref_type: RefType::Section,
            },

            Location {
                room: Some(Room {
                    id, section: None, ..
                }),
                ..
            } => Ref {
                id: *id,
                ref_type: RefType::Room,
            },

            Location { room: None, .. } => Ref {
                id: self.id,
                ref_type: RefType::Location,
            },
        }
    }
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Room {
    pub id: i32,
    pub name: String,
    pub section: Option<Section>,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Section {
    pub id: i32,
    pub name: String,
}

#[derive(Clone, Debug)]
pub struct Ref {
    pub id: i32,
    pub ref_type: RefType,
}

#[derive(Clone, Copy, PartialEq, Eq, Display, Debug)]
pub enum RefType {
    Location,
    Room,
    Section,
}

#[derive(Debug, PartialEq, Eq, Clone, Hash)]
pub enum LocationIngest {
    Location {
        name: String,
    },

    Room {
        location_name: String,
        room_name: String,
    },

    Section {
        location_name: String,
        room_name: String,
        section_name: String,
    },
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct LocationOnly {
    pub id: i32,
    pub name: String,
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct RoomOnly {
    pub id: i32,
    pub location_id: i32,
    pub name: String,
}

#[derive(PartialEq, Eq, Hash, Debug, Clone)]
pub struct RoomOnlyRef<'room> {
    pub location_id: i32,
    pub name: &'room str,
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct SectionOnly {
    pub id: i32,
    pub room_id: i32,
    pub name: String,
}

#[derive(PartialEq, Eq, Hash, Debug)]
pub struct SectionOnlyRef<'section> {
    pub room_id: i32,
    pub name: &'section str,
}

pub mod driven_ports {
    use super::*;
    use crate::domain::BulkLookupResult;
    use crate::external_connections::ExternalConnectivity;

    pub trait LocationReader {
        async fn read_matching_locations(
            &self,
            location_names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<LocationOnly, anyhow::Error>;

        async fn read_matching_rooms(
            &self,
            room_refs: &[RoomOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<RoomOnly, anyhow::Error>;

        async fn read_matching_sections(
            &self,
            section_refs: &[SectionOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<SectionOnly, anyhow::Error>;
    }

    pub trait LocationWriter {
        async fn bulk_save_locations(
            &self,
            location_names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;

        async fn bulk_save_rooms(
            &self,
            room_refs: &[&RoomOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;

        async fn bulk_save_sections(
            &self,
            section_refs: &[&SectionOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;
    }
}

#[tracing::instrument(skip_all, fields(first_10 = ?incoming_locations.get(0..10), total = incoming_locations.len()))]
pub(super) async fn save_locations(
    incoming_locations: &[LocationIngest],
    reader: &impl LocationReader,
    writer: &impl LocationWriter,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Vec<Location>, anyhow::Error> {
    // Assemble the list of locations
    let locations: Vec<&str> = incoming_locations
        .iter()
        .map(|location| match location {
            LocationIngest::Location { name } => name.as_str(),
            LocationIngest::Room { location_name, .. } => location_name.as_str(),
            LocationIngest::Section { location_name, .. } => location_name.as_str(),
        })
        .collect();

    // Read the set of locations
    let mut maybe_full_locations: Vec<Option<LocationOnly>> = reader
        .read_matching_locations(&locations, ext_cxn)
        .await
        .context("reading existing locations")?;

    // Write the missing locations & collect IDs
    let (missing_locations, location_save_dests): (Vec<&str>, Vec<&mut Option<LocationOnly>>) =
        locations
            .iter()
            .zip(maybe_full_locations.iter_mut())
            .filter_map(|(location, maybe_full_location)| {
                if maybe_full_location.is_none() {
                    Some((*location, maybe_full_location))
                } else {
                    None
                }
            })
            .collect();
    let new_location_ids = writer
        .bulk_save_locations(&missing_locations, &mut *ext_cxn)
        .await
        .context("saving missing locations")?;

    for ((id, location_name), dest) in new_location_ids
        .into_iter()
        .zip(missing_locations.into_iter())
        .zip(location_save_dests.into_iter())
    {
        *dest = Some(LocationOnly {
            id,
            name: location_name.to_owned(),
        })
    }

    // This is safe because the previous loop turned all "None" values into "Some"
    let full_locations = maybe_full_locations
        .into_iter()
        .collect::<Option<Vec<_>>>()
        .unwrap();
    let location_id_by_name: HashMap<&str, i32> = full_locations
        .iter()
        .map(|location| (location.name.as_str(), location.id))
        .collect();

    // Assemble the list of rooms, affiliating them with the list of locations
    let incoming_rooms: Vec<RoomOnlyRef> = incoming_locations
        .iter()
        .filter_map(|location| match location {
            LocationIngest::Location { .. } => None,
            LocationIngest::Room {
                location_name,
                room_name,
            } => Some(RoomOnlyRef {
                location_id: location_id_by_name[location_name.as_str()],
                name: room_name.as_str(),
            }),
            LocationIngest::Section {
                location_name,
                room_name,
                ..
            } => Some(RoomOnlyRef {
                location_id: location_id_by_name[location_name.as_str()],
                name: room_name.as_str(),
            }),
        })
        .collect();

    // Read the set of rooms
    let mut maybe_rooms = reader
        .read_matching_rooms(&incoming_rooms, ext_cxn)
        .await
        .context("reading existing rooms")?;
    let (missing_rooms, write_targets): (Vec<&RoomOnlyRef>, Vec<&mut Option<RoomOnly>>) =
        incoming_rooms
            .iter()
            .zip(maybe_rooms.iter_mut())
            .filter_map(|(room, maybe_existing_room)| {
                if maybe_existing_room.is_none() {
                    Some((room, maybe_existing_room))
                } else {
                    None
                }
            })
            .collect();

    // Write the missing rooms & collect IDs
    let missing_room_ids = writer
        .bulk_save_rooms(&missing_rooms, &mut *ext_cxn)
        .await
        .context("saving missing rooms")?;
    for ((missing_room_id, missing_room), room_save_dest) in missing_room_ids
        .into_iter()
        .zip(missing_rooms.into_iter())
        .zip(write_targets.into_iter())
    {
        *room_save_dest = Some(RoomOnly {
            id: missing_room_id,
            location_id: missing_room.location_id,
            name: missing_room.name.to_owned(),
        })
    }

    // This is safe because the last loop turned all the optionals into the "some" variant
    let all_rooms = maybe_rooms.into_iter().collect::<Option<Vec<_>>>().unwrap();
    let room_id_by_name_and_loc: HashMap<(i32, &str), i32> = all_rooms
        .iter()
        .map(|room| ((room.location_id, room.name.as_str()), room.id))
        .collect();

    // Assemble the list of sections, affiliating them with the list of rooms
    let incoming_sections: Vec<SectionOnlyRef> = incoming_locations
        .iter()
        .filter_map(|location| {
            if let LocationIngest::Section {
                location_name,
                room_name,
                section_name,
            } = location
            {
                let location_id = location_id_by_name[location_name.as_str()];
                let room_id = room_id_by_name_and_loc[&(location_id, room_name.as_str())];
                Some(SectionOnlyRef {
                    room_id,
                    name: section_name.as_str(),
                })
            } else {
                None
            }
        })
        .collect();

    // Read the set of sections
    let mut maybe_sections = reader
        .read_matching_sections(&incoming_sections, ext_cxn)
        .await
        .context("reading existing sections")?;
    let (missing_sections, write_targets): (Vec<&SectionOnlyRef>, Vec<&mut Option<SectionOnly>>) =
        incoming_sections
            .iter()
            .zip(maybe_sections.iter_mut())
            .filter_map(|(section, maybe_existing_section)| {
                if maybe_existing_section.is_none() {
                    Some((section, maybe_existing_section))
                } else {
                    None
                }
            })
            .collect();

    // Write the missing sections & collect IDs
    let new_section_ids = writer
        .bulk_save_sections(&missing_sections, &mut *ext_cxn)
        .await
        .context("saving missing sections")?;
    for ((new_id, missing_section), section_write_target) in new_section_ids
        .into_iter()
        .zip(missing_sections.into_iter())
        .zip(write_targets.into_iter())
    {
        *section_write_target = Some(SectionOnly {
            id: new_id,
            room_id: missing_section.room_id,
            name: missing_section.name.to_owned(),
        })
    }

    // This is safe because the last loop turned all the optionals into the "some" variant
    let all_sections = maybe_sections
        .into_iter()
        .collect::<Option<Vec<_>>>()
        .unwrap();
    let section_id_by_name_and_room: HashMap<(i32, &str), i32> = all_sections
        .iter()
        .map(|section| ((section.room_id, section.name.as_str()), section.id))
        .collect();

    // Synthesize the locations, rooms, and sections back into a Vec<Location>
    let created_locations: Vec<Location> = incoming_locations
        .iter()
        .map(|incoming_location| {
            location_from_ingest(
                incoming_location.clone(),
                &location_id_by_name,
                &room_id_by_name_and_loc,
                &section_id_by_name_and_room,
            )
        })
        .collect();

    Ok(created_locations)
}

fn location_from_ingest(
    ingest_loc: LocationIngest,
    location_id_by_name: &HashMap<&str, i32>,
    room_id_by_name_and_loc: &HashMap<(i32, &str), i32>,
    section_id_by_name_and_room: &HashMap<(i32, &str), i32>,
) -> Location {
    match ingest_loc {
        LocationIngest::Location { name } => Location {
            id: location_id_by_name[name.as_str()],
            name,
            room: None,
        },

        LocationIngest::Room {
            location_name,
            room_name,
        } => {
            let location_id = location_id_by_name[location_name.as_str()];

            Location {
                id: location_id,
                name: location_name,
                room: Some(Room {
                    id: room_id_by_name_and_loc[&(location_id, room_name.as_str())],
                    name: room_name,
                    section: None,
                }),
            }
        }

        LocationIngest::Section {
            location_name,
            room_name,
            section_name,
        } => {
            let location_id = location_id_by_name[location_name.as_str()];
            let room_id = room_id_by_name_and_loc[&(location_id, room_name.as_str())];

            Location {
                id: location_id,
                name: location_name,
                room: Some(Room {
                    id: room_id,
                    name: room_name,
                    section: Some(Section {
                        id: section_id_by_name_and_room[&(room_id, section_name.as_str())],
                        name: section_name,
                    }),
                }),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    mod save_locations {
        use super::*;
        use crate::external_connections;
        use std::default::Default;
        use std::sync::Mutex;

        #[tokio::test]
        async fn saves_locations_properly() {
            let existing_locations = vec![
                LocationOnly {
                    id: 1,
                    name: "Hyatt".to_owned(),
                }
            ];
            let existing_rooms = vec![
                RoomOnly {
                    id: 3,
                    location_id: 1,
                    name: "Ballroom A".to_owned(),
                }
            ];
            let existing_sections = vec![
                SectionOnly {
                    id: 7,
                    room_id: 3,
                    name: "Left Half".to_owned(),
                }
            ];

            let location_storage = Mutex::new(test_util::FakeLocationStorage {
                locations: existing_locations,
                rooms: existing_rooms,
                sections: existing_sections,
                location_storage_failures: Default::default(),
            });
            let mut fake_connectivity = external_connections::test_util::FakeExternalConnectivity::new();

            let ingested_locations = [
                LocationIngest::Location {
                    name: "Westin".to_owned(),
                },
                LocationIngest::Location {
                    name: "Hyatt".to_owned(),
                },

                LocationIngest::Room {
                    location_name: "Hyatt".to_owned(),
                    room_name: "Ballroom B".to_owned(),
                },
                LocationIngest::Room {
                    location_name: "Hyatt".to_owned(),
                    room_name: "Ballroom A".to_owned(),
                },
                LocationIngest::Room {
                    location_name: "Westin".to_owned(),
                    room_name: "Ballroom A".to_owned(),
                },

                LocationIngest::Section {
                    location_name: "Hyatt".to_owned(),
                    room_name: "Ballroom A".to_owned(),
                    section_name: "Left Half".to_owned(),
                },
                LocationIngest::Section {
                    location_name: "Hyatt".to_owned(),
                    room_name: "Ballroom A".to_owned(),
                    section_name: "Right Half".to_owned(),
                },
                LocationIngest::Section {
                    location_name: "Hyatt".to_owned(),
                    room_name: "Ballroom B".to_owned(),
                    section_name: "Left Half".to_owned(),
                },
                LocationIngest::Section {
                    location_name: "Westin".to_owned(),
                    room_name: "Ballroom A".to_owned(),
                    section_name: "Left Half".to_owned(),
                },
                LocationIngest::Section {
                    location_name: "Westin".to_owned(),
                    room_name: "Ballroom B".to_owned(),
                    section_name: "Left Half".to_owned(),
                }
            ];

            let expected_locations = [LocationOnly {
                    id: 1,
                    name: "Hyatt".to_owned(),
                },
                LocationOnly {
                    id: 2,
                    name: "Westin".to_owned(),
                }];

            let expected_rooms = [RoomOnly {
                    id: 3,
                    location_id: 1,
                    name: "Ballroom A".to_owned(),
                },
                RoomOnly {
                    id: 4,
                    location_id: 1,
                    name: "Ballroom B".to_owned(),
                },
                RoomOnly {
                    id: 5,
                    location_id: 2,
                    name: "Ballroom A".to_owned(),
                },
                RoomOnly {
                    id: 6,
                    location_id: 2,
                    name: "Ballroom B".to_owned(),
                }];

            let expected_sections = [SectionOnly {
                    id: 7,
                    room_id: 3,
                    name: "Left Half".to_owned(),
                },
                SectionOnly {
                    id: 8,
                    room_id: 3,
                    name: "Right Half".to_owned(),
                },
                SectionOnly {
                    id: 9,
                    room_id: 4,
                    name: "Left Half".to_owned(),
                },
                SectionOnly {
                    id: 10,
                    room_id: 5,
                    name: "Left Half".to_owned(),
                },
                SectionOnly {
                    id: 11,
                    room_id: 6,
                    name: "Left Half".to_owned(),
                }];

            let expected_result = [
                Location {
                    id: 2,
                    name: "Westin".to_owned(),
                    room: None,
                },
                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: None,
                },

                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: Some(Room{
                        id: 4,
                        name: "Ballroom B".to_owned(),
                        section: None,
                    })
                },
                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: Some(Room{
                        id: 3,
                        name: "Ballroom A".to_owned(),
                        section: None,
                    })
                },
                Location {
                    id: 2,
                    name: "Westin".to_owned(),
                    room: Some(Room {
                        id: 5,
                        name: "Ballroom A".to_owned(),
                        section: None,
                    })
                },

                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: Some(Room {
                        id: 3,
                        name: "Ballroom A".to_owned(),
                        section: Some(Section {
                            id: 7,
                            name: "Left Half".to_owned(),
                        })
                    })
                },
                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: Some(Room {
                        id: 3,
                        name: "Ballroom A".to_owned(),
                        section: Some(Section {
                            id: 8,
                            name: "Right Half".to_owned(),
                        })
                    })
                },
                Location {
                    id: 1,
                    name: "Hyatt".to_owned(),
                    room: Some(Room {
                        id: 4,
                        name: "Ballroom B".to_owned(),
                        section: Some(Section {
                            id: 9,
                            name: "Left Half".to_owned(),
                        })
                    })
                },
                Location {
                    id: 2,
                    name: "Westin".to_owned(),
                    room: Some(Room {
                        id: 5,
                        name: "Ballroom A".to_owned(),
                        section: Some(Section {
                            id: 10,
                            name: "Left Half".to_owned(),
                        })
                    })
                },
                Location {
                    id: 2,
                    name: "Westin".to_owned(),
                    room: Some(Room {
                        id: 6,
                        name: "Ballroom B".to_owned(),
                        section: Some(Section {
                            id: 11,
                            name: "Left Half".to_owned(),
                        })
                    })
                }
            ];

            let save_result = save_locations(&ingested_locations, &location_storage, &location_storage, &mut fake_connectivity).await;
            let Ok(location_results) = save_result else {
                let err = save_result.unwrap_err();
                panic!("Failed to save locations: {err}");
            };

            assert_eq!(expected_result, location_results.as_slice());

            let locked_storage = location_storage.lock().expect("Failed to lock location storage during assertions");
            assert_eq!(expected_locations, locked_storage.locations.as_slice());
            assert_eq!(expected_rooms, locked_storage.rooms.as_slice());
            assert_eq!(expected_sections, locked_storage.sections.as_slice());
        }
    }
}

#[cfg(test)]
mod test_util {
    use super::*;
    use crate::domain;
    use crate::domain::BulkLookupResult;
    use std::ops::Deref;
    use std::sync::Mutex;

    pub struct LocationStorageFuncs {
        pub location_read_err:
            domain::test_util::FakeImpl<Vec<String>, BulkLookupResult<LocationOnly, anyhow::Error>>,
        pub room_read_err: domain::test_util::FakeImpl<
            Vec<(i32, String)>,
            BulkLookupResult<RoomOnly, anyhow::Error>,
        >,
        pub section_read_err: domain::test_util::FakeImpl<
            Vec<(i32, String)>,
            BulkLookupResult<SectionOnly, anyhow::Error>,
        >,

        pub location_write_err: domain::test_util::FakeImpl<Vec<String>, anyhow::Result<Vec<i32>>>,
        pub room_write_err:
            domain::test_util::FakeImpl<Vec<(i32, String)>, anyhow::Result<Vec<i32>>>,
        pub section_write_err:
            domain::test_util::FakeImpl<Vec<(i32, String)>, anyhow::Result<Vec<i32>>>,
    }

    impl Default for LocationStorageFuncs {
        fn default() -> Self {
            Self {
                location_read_err: domain::test_util::FakeImpl::new(),
                room_read_err: domain::test_util::FakeImpl::new(),
                section_read_err: domain::test_util::FakeImpl::new(),

                location_write_err: domain::test_util::FakeImpl::new(),
                room_write_err: domain::test_util::FakeImpl::new(),
                section_write_err: domain::test_util::FakeImpl::new(),
            }
        }
    }

    pub struct FakeLocationStorage {
        pub locations: Vec<LocationOnly>,
        pub rooms: Vec<RoomOnly>,
        pub sections: Vec<SectionOnly>,
        pub location_storage_failures: LocationStorageFuncs,
    }

    impl LocationReader for Mutex<FakeLocationStorage> {
        async fn read_matching_locations(
            &self,
            location_names: &[&str],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> BulkLookupResult<LocationOnly, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for reading locations");

            // Make use of fake impls
            let this_fake = &mut locked_self.location_storage_failures.location_read_err;
            this_fake.save_arguments(
                location_names
                    .iter()
                    .map(Deref::deref)
                    .map(str::to_owned)
                    .collect(),
            );
            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Fallback "fake" logic
            if location_names.is_empty() {
                return Ok(Vec::new());
            }
            let location_name_to_id: HashMap<&str, i32> = locked_self.locations.iter().map(|location| (location.name.as_str(), location.id)).collect();

            let matching_locations: Vec<Option<LocationOnly>> = location_names.iter().map(|name| {
                location_name_to_id.get(name).map(|id| {
                    LocationOnly {
                        id: *id,
                        name: name.to_string(),
                    }
                })
            }).collect();

            Ok(matching_locations)
        }

        async fn read_matching_rooms(
            &self,
            room_refs: &[RoomOnlyRef<'_>],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<RoomOnly>>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for reading rooms");

            // Attempt the mock first
            let this_fake = &mut locked_self.location_storage_failures.room_read_err;
            this_fake.save_arguments(
                room_refs
                    .iter()
                    .map(|RoomOnlyRef { location_id, name }| (*location_id, (*name).to_owned()))
                    .collect(),
            );
            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Fallback fake logic
            if room_refs.is_empty() {
                return Ok(Vec::new());
            }
            let room_ref_to_id: HashMap<RoomOnlyRef, i32> = locked_self
                .rooms
                .iter()
                .map(|room| {
                    (
                        RoomOnlyRef {
                            location_id: room.location_id,
                            name: room.name.as_str(),
                        },
                        room.id,
                    )
                })
                .collect();

            let detected_rooms: Vec<Option<RoomOnly>> = room_refs
                .iter()
                .map(|room_ref| {
                    room_ref_to_id.get(room_ref).map(|room_id| RoomOnly {
                        id: *room_id,
                        location_id: room_ref.location_id,
                        name: room_ref.name.to_owned(),
                    })
                })
                .collect();

            Ok(detected_rooms)
        }

        async fn read_matching_sections(
            &self,
            section_refs: &[SectionOnlyRef<'_>],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<SectionOnly>>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for reading sections");

            // Attempt the mock first
            let this_fake = &mut locked_self.location_storage_failures.section_read_err;
            let mapped_args: Vec<(i32, String)> = section_refs
                .iter()
                .map(|sec_ref| (sec_ref.room_id, sec_ref.name.to_owned()))
                .collect();
            this_fake.save_arguments(mapped_args);

            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Fallback fake logic
            if section_refs.is_empty() {
                return Ok(Vec::new());
            }
            let section_ref_to_id: HashMap<SectionOnlyRef, i32> = locked_self
                .sections
                .iter()
                .map(|section| {
                    (
                        SectionOnlyRef {
                            room_id: section.room_id,
                            name: section.name.as_str(),
                        },
                        section.id,
                    )
                })
                .collect();

            let detected_sections: Vec<Option<SectionOnly>> = section_refs
                .iter()
                .map(|sec_ref| {
                    section_ref_to_id.get(sec_ref).map(|sec_id| SectionOnly {
                        id: *sec_id,
                        room_id: sec_ref.room_id,
                        name: sec_ref.name.to_owned(),
                    })
                })
                .collect();

            Ok(detected_sections)
        }
    }

    impl LocationWriter for Mutex<FakeLocationStorage> {
        async fn bulk_save_locations(
            &self,
            location_names: &[&str],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for writing locations");

            // Try mock first
            let this_fake = &mut locked_self.location_storage_failures.location_write_err;
            this_fake.save_arguments(
                location_names
                    .iter()
                    .map(|name| (*name).to_owned())
                    .collect(),
            );

            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Backup fake logic
            let mut next_loc_id = locked_self
                .locations
                .iter()
                .map(|location| location.id)
                .max()
                .unwrap_or(0)
                + 1;
            let mut saved_ids: Vec<i32> = Vec::with_capacity(location_names.len());
            let mut already_saved_names: HashMap<&str, i32> = HashMap::new();

            for location_name in location_names.iter() {
                if let Some(id) = already_saved_names.get(location_name) {
                    saved_ids.push(*id);
                    continue;
                }

                saved_ids.push(next_loc_id);
                locked_self.locations.push(LocationOnly {
                    id: next_loc_id,
                    name: location_name.to_string(),
                });
                already_saved_names.insert(location_name, next_loc_id);

                next_loc_id += 1;
            }

            Ok(saved_ids)
        }

        async fn bulk_save_rooms(
            &self,
            room_refs: &[&RoomOnlyRef<'_>],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for writing rooms");

            // Try mock first
            let this_fake = &mut locked_self.location_storage_failures.room_write_err;
            this_fake.save_arguments(
                room_refs
                    .iter()
                    .map(|RoomOnlyRef { location_id, name }| (*location_id, name.to_string()))
                    .collect(),
            );

            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Backup fake logic
            let mut next_room_id = locked_self
                .rooms
                .iter()
                .map(|room| room.id)
                .max()
                .unwrap_or(0)
                + 1;
            let mut saved_ids: Vec<i32> = Vec::with_capacity(room_refs.len());
            let mut already_saved_refs: HashMap<&RoomOnlyRef, i32> = HashMap::new();

            for room_ref in room_refs.iter() {
                if let Some(id) = already_saved_refs.get(room_ref) {
                    saved_ids.push(*id);
                    continue;
                }

                saved_ids.push(next_room_id);
                locked_self.rooms.push(RoomOnly {
                    id: next_room_id,
                    location_id: room_ref.location_id,
                    name: room_ref.name.to_owned(),
                });
                already_saved_refs.insert(room_ref, next_room_id);

                next_room_id += 1;
            }

            Ok(saved_ids)
        }

        async fn bulk_save_sections(
            &self,
            section_refs: &[&SectionOnlyRef<'_>],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("could not lock location storage for writing sections");

            // Try mock first
            let this_fake = &mut locked_self.location_storage_failures.section_write_err;
            this_fake.save_arguments(
                section_refs
                    .iter()
                    .map(|SectionOnlyRef { room_id, name }| (*room_id, name.to_string()))
                    .collect(),
            );

            if let Some(ret_val) = this_fake.try_return_value_anyhow() {
                return ret_val;
            }

            // Backup fake logic
            let mut next_section_id = locked_self
                .sections
                .iter()
                .map(|section| section.id)
                .max()
                .unwrap_or(0)
                + 1;
            let mut saved_ids: Vec<i32> = Vec::with_capacity(section_refs.len());
            let mut already_saved_refs: HashMap<&SectionOnlyRef, i32> = HashMap::new();

            for section_ref in section_refs.iter() {
                if let Some(id) = already_saved_refs.get(section_ref) {
                    saved_ids.push(*id);
                    continue;
                }

                saved_ids.push(next_section_id);
                locked_self.sections.push(SectionOnly {
                    id: next_section_id,
                    room_id: section_ref.room_id,
                    name: section_ref.name.to_owned(),
                });
                already_saved_refs.insert(section_ref, next_section_id);

                next_section_id += 1;
            }

            Ok(saved_ids)
        }
    }
}
