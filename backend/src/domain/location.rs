#![expect(dead_code)]

use std::collections::HashMap;
use anyhow::Context;
use crate::domain::location::driven_ports::{LocationReader, LocationWriter};
use crate::external_connections::ExternalConnectivity;
#[cfg(test)]
use serde::Serialize;

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

#[derive(Debug, PartialEq, Eq, Hash)]
#[cfg_attr(test, derive(Serialize))]
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

pub struct LocationOnly {
    pub id: i32,
    pub name: String,
}

pub struct RoomOnly {
    pub id: i32,
    pub location_id: i32,
    pub name: String,
}

pub struct RoomOnlyRef<'room> {
    pub location_id: i32,
    pub name: &'room str,
}

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
    use crate::external_connections::ExternalConnectivity;

    pub trait LocationReader {
        async fn read_matching_locations(
            &self,
            location_names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<LocationOnly>>, anyhow::Error>;

        async fn read_matching_rooms(
            &self,
            room_refs: &[RoomOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<RoomOnly>>, anyhow::Error>;

        async fn read_matching_sections(
            &self,
            section_refs: &[SectionOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<SectionOnly>>, anyhow::Error>;
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
            section_refs: &[SectionOnlyRef<'_>],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<i32>, anyhow::Error>;
    }
}

pub(super) async fn save_locations(
    incoming_locations: &[LocationIngest],
    reader: &impl LocationReader,
    writer: &impl LocationWriter,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<() /*Vec<Location>*/, anyhow::Error> {
    // TODO update the return value eventually
    
    // Assemble the list of locations
    let locations: Vec<&str> = incoming_locations.iter().map(|location| {
        match location {
            LocationIngest::Location { name} => name.as_str(),
            LocationIngest::Room { location_name, ..} => location_name.as_str(),
            LocationIngest::Section { location_name, ..} => location_name.as_str(),
        }
    }).collect();
    
    // Read the set of locations
    let mut maybe_full_locations: Vec<Option<LocationOnly>> = reader.read_matching_locations(&locations, ext_cxn).await.context("reading existing locations")?;
    
    // Write the missing locations & collect IDs
    let (missing_locations, location_save_dests): (Vec<&str>, Vec<&mut Option<LocationOnly>>) = locations.iter().zip(maybe_full_locations.iter_mut())
        .filter_map(|(location, maybe_full_location)| {
            if maybe_full_location.is_none() {
                Some((*location, maybe_full_location))
            } else {
                None
            }
        }).collect();
    let new_location_ids = writer.bulk_save_locations(&missing_locations, &mut *ext_cxn).await.context("saving missing locations")?;
    
    for ((id, location_name), dest) in new_location_ids.into_iter().zip(missing_locations.into_iter()).zip(location_save_dests.into_iter()) {
        *dest = Some(LocationOnly{
            id,
            name: location_name.to_owned(),
        })
    }
    
    // This is safe because the previous loop turned all "None" values into "Some"
    let full_locations = maybe_full_locations.into_iter().collect::<Option<Vec<_>>>().unwrap();
    let location_id_by_name: HashMap<&str, i32> = full_locations.iter().map(|location| (location.name.as_str(), location.id)).collect();
    
    // Assemble the list of rooms, affiliating them with the list of locations
    let incoming_rooms: Vec<RoomOnlyRef> = incoming_locations.iter().filter_map(|location| {
        match location {
            LocationIngest::Location{ .. } => None,
            LocationIngest::Room { location_name, room_name} => Some(RoomOnlyRef {
                location_id: location_id_by_name[location_name.as_str()],
                name: room_name.as_str(),
            }),
            LocationIngest::Section { location_name, room_name, .. } => Some(RoomOnlyRef {
                location_id: location_id_by_name[location_name.as_str()],
                name: room_name.as_str(),
            }),
        }
    }).collect();
    
    // Read the set of rooms
    let mut maybe_rooms = reader.read_matching_rooms(&incoming_rooms, ext_cxn).await.context("reading existing rooms")?;
    let (missing_rooms, write_targets): (Vec<&RoomOnlyRef>, Vec<&mut Option<RoomOnly>>) = incoming_rooms.iter().zip(maybe_rooms.iter_mut())
        .filter_map(|(room, maybe_existing_room)| {
            if maybe_existing_room.is_none() {
                Some((room, maybe_existing_room))
            } else {
                None
            }
        }).collect();
    
    // Write the missing rooms & collect IDs
    let missing_room_ids = writer.bulk_save_rooms(&missing_rooms, &mut *ext_cxn).await.context("saving missing rooms")?;
    for ((missing_room_id, missing_room), room_save_dest) in missing_room_ids.into_iter().zip(missing_rooms.into_iter()).zip(write_targets.into_iter()) {
        *room_save_dest = Some(RoomOnly {
            id: missing_room_id,
            location_id: missing_room.location_id,
            name: missing_room.name.to_owned(),
        })
    }
    // TODO continue from here
    
    // Assemble the list of sections, affiliating them with the list of rooms
    
    // Read the set of sections
    
    // Write the missing sections & collect IDs
    
    // Synthesize the locations, rooms, and sections back into a Vec<Location>
    
    Ok(())
}
