use anyhow::Error;
use crate::domain;
use crate::domain::location::{LocationOnly, RoomOnly, RoomOnlyRef, SectionOnly, SectionOnlyRef};
use crate::external_connections::ExternalConnectivity;

pub struct DbLocationReader;

struct LocationOnlyDTO {
    id: i32,
    location_name: String,
}

struct RoomOnlyDTO {
    id: i32,
    location_id: i32,
    room_name: String,
}

struct SectionOnlyDTO {
    id: i32,
    room_id: i32,
    section_name: String,
}

impl domain::location::driven_ports::LocationReader for DbLocationReader {
    async fn read_matching_locations(&self, location_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> crate::domain::BulkLookupResult<LocationOnly, Error> {
        todo!()
    }

    async fn read_matching_rooms(&self, room_refs: &[RoomOnlyRef<'_>], ext_cxn: &mut impl ExternalConnectivity) -> crate::domain::BulkLookupResult<RoomOnly, Error> {
        todo!()
    }

    async fn read_matching_sections(&self, section_refs: &[SectionOnlyRef<'_>], ext_cxn: &mut impl ExternalConnectivity) -> crate::domain::BulkLookupResult<SectionOnly, Error> {
        todo!()
    }
}

pub struct DbLocationWriter;

impl domain::location::driven_ports::LocationWriter for DbLocationWriter {
    async fn bulk_save_locations(&self, location_names: &[&str], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }

    async fn bulk_save_rooms(&self, room_refs: &[&RoomOnlyRef<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }

    async fn bulk_save_sections(&self, section_refs: &[&SectionOnlyRef<'_>], ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<i32>, Error> {
        todo!()
    }
}