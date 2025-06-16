use std::collections::HashMap;

use crate::domain;
use crate::domain::location::{LocationOnly, RoomOnly, RoomOnlyRef, SectionOnly, SectionOnlyRef};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{Context, Error};

pub struct DbLocationReader;

struct LocationOnlyDTO {
    id: i16,
    location_name: String,
}

struct RoomOnlyDTO {
    id: i16,
    location_id: i16,
    room_name: String,
}

struct SectionOnlyDTO {
    id: i16,
    room_id: i16,
    section_name: String,
}

impl domain::location::driven_ports::LocationReader for DbLocationReader {
    async fn read_matching_locations(
        &self,
        location_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> crate::domain::BulkLookupResult<LocationOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read locations.")?;

        let mut fetched_rows: Vec<Option<LocationOnly>> = Vec::with_capacity(location_names.len());

        for name in location_names.iter().cloned() {
            let name_id = sqlx::query!("SELECT id FROM locations WHERE location_name = $1", name)
                .fetch_optional(cxn.borrow_connection())
                .await?;

            fetched_rows.push(name_id.map(|row| LocationOnly {
                id: row.id as i32,
                name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    async fn read_matching_rooms(
        &self,
        room_refs: &[RoomOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> crate::domain::BulkLookupResult<RoomOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read rooms.")?;

        let mut fetched_rows: Vec<Option<RoomOnly>> = Vec::with_capacity(room_refs.len());

        for RoomOnlyRef { location_id, name } in room_refs.iter() {
            let name_id = sqlx::query!(
                "SELECT id FROM rooms WHERE room_name = $1 AND location_id = $2",
                name,
                *location_id as i16,
            )
            .fetch_optional(cxn.borrow_connection())
            .await?;

            fetched_rows.push(name_id.map(|row| RoomOnly {
                id: row.id as i32,
                location_id: *location_id,
                name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }

    async fn read_matching_sections(
        &self,
        section_refs: &[SectionOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> crate::domain::BulkLookupResult<SectionOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read sections.")?;

        let mut fetched_rows: Vec<Option<SectionOnly>> = Vec::with_capacity(section_refs.len());

        for SectionOnlyRef { room_id, name } in section_refs.iter() {
            let name_id = sqlx::query!(
                "SELECT id FROM sections WHERE section_name = $1 AND room_id = $2",
                name,
                *room_id,
            )
            .fetch_optional(cxn.borrow_connection())
            .await?;

            fetched_rows.push(name_id.map(|row| SectionOnly {
                id: row.id as i32,
                room_id: *room_id,
                name: name.to_string(),
            }));
        }

        Ok(fetched_rows)
    }
}

pub struct DbLocationWriter;

impl domain::location::driven_ports::LocationWriter for DbLocationWriter {
    async fn bulk_save_locations(
        &self,
        location_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        todo!()
    }

    async fn bulk_save_rooms(
        &self,
        room_refs: &[&RoomOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        todo!()
    }

    async fn bulk_save_sections(
        &self,
        section_refs: &[&SectionOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        todo!()
    }
}
