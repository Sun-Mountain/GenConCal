#![expect(dead_code)]

use crate::domain::location::driven_ports::{LocationReader, LocationWriter};
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;
#[cfg(test)]
use serde::Serialize;
use std::collections::HashMap;

pub struct Location {
    pub id: i32,
    pub name: String,
    pub room: Option<Room>,
}

impl Location {
    pub fn to_location_ref(&self) -> Ref {
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

pub struct Room {
    pub id: i32,
    pub name: String,
    pub section: Option<Section>,
}

pub struct Section {
    pub id: i32,
    pub name: String,
}

pub struct Ref {
    pub id: i32,
    pub ref_type: RefType,
}

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

#[derive(Clone)]
pub struct LocationOnly {
    pub id: i32,
    pub name: String,
}

#[derive(Clone)]
pub struct RoomOnly {
    pub id: i32,
    pub location_id: i32,
    pub name: String,
}

#[derive(PartialEq, Eq, Hash)]
pub struct RoomOnlyRef<'room> {
    pub location_id: i32,
    pub name: &'room str,
}

#[derive(Clone)]
pub struct SectionOnly {
    pub id: i32,
    pub room_id: i32,
    pub name: String,
}

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
                let room_id = room_id_by_name_and_loc[&(location_id, section_name.as_str())];
                Some(SectionOnlyRef {
                    room_id,
                    name: room_name.as_str(),
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
            let room_id = room_id_by_name_and_loc[&(location_id, section_name.as_str())];

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
mod tests {}

#[cfg(test)]
mod test_util {
    use super::*;
    use crate::domain;
    use crate::domain::BulkLookupResult;
    use std::collections::HashSet;
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
    }

    impl Default for LocationStorageFuncs {
        fn default() -> Self {
            Self {
                location_read_err: domain::test_util::FakeImpl::new(),
                room_read_err: domain::test_util::FakeImpl::new(),
                section_read_err: domain::test_util::FakeImpl::new(),
            }
        }
    }

    pub struct FakeLocationStorage {
        pub locations: Vec<Location>,
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
            let names_to_search_for: HashSet<&str> = location_names.iter().copied().collect();

            let matching_locations: Vec<Option<LocationOnly>> = locked_self
                .locations
                .iter()
                .map(|location| {
                    if names_to_search_for.contains(location.name.as_str()) {
                        Some(LocationOnly {
                            id: location.id,
                            name: location.name.clone(),
                        })
                    } else {
                        None
                    }
                })
                .collect();

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
            let names_to_search_for: HashSet<&RoomOnlyRef<'_>> = room_refs.iter().collect();

            let detection_results: Vec<Option<RoomOnly>> = locked_self
                .locations
                .iter()
                .map(|location| {
                    if let Location {
                        id: location_id,
                        room:
                            Some(Room {
                                id: room_id, name, ..
                            }),
                        ..
                    } = location
                    {
                        if names_to_search_for.contains(&RoomOnlyRef {
                            location_id: *location_id,
                            name,
                        }) {
                            Some(RoomOnly {
                                location_id: *location_id,
                                id: *room_id,
                                name: name.clone(),
                            })
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                })
                .collect();

            Ok(detection_results)
        }

        async fn read_matching_sections(
            &self,
            section_refs: &[SectionOnlyRef<'_>],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<SectionOnly>>, anyhow::Error> {
            todo!()
        }
    }
}
