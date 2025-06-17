use std::collections::HashMap;

use crate::domain;
use crate::domain::location::{LocationOnly, RoomOnly, RoomOnlyRef, SectionOnly, SectionOnlyRef};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{anyhow, Context, Error};
use sqlx::{FromRow, Postgres};

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

        for name in location_names {
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

static LOCATION_INSERT_PARAMS: usize = 1;
static ROOM_INSERT_PARAMS: usize = 2;
static SECTION_INSERT_PARAMS: usize = 2;

static LOCATION_INSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / LOCATION_INSERT_PARAMS;
static ROOM_INSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / ROOM_INSERT_PARAMS;
static SECTION_INSERT_CHUNK_SIZE: usize = super::PG_PARAM_LIMIT / SECTION_INSERT_PARAMS;

#[derive(FromRow)]
struct InsertedLocationDTO {
    id: i16,
    location_name: String,
}

#[derive(FromRow)]
struct InsertedRoomDTO {
    id: i32,
    location_id: i16,
    room_name: String,
}

impl <'dto> From<&'dto InsertedRoomDTO> for RoomOnlyRef<'dto> {
    fn from(dto: &'dto InsertedRoomDTO) -> Self {
        RoomOnlyRef {
            location_id: dto.location_id as i32,
            name: dto.room_name.as_str(),
        }
    }
}

#[derive(FromRow)]
struct InsertedSectionDTO {
    id: i32,
    room_id: i32,
    section_name: String,
}

impl <'dto> From<&'dto InsertedSectionDTO> for SectionOnlyRef<'dto> {
    fn from(dto: &'dto InsertedSectionDTO) -> Self {
        SectionOnlyRef {
            room_id: dto.room_id,
            name: dto.section_name.as_str(),
        }
    }
}

pub struct DbLocationWriter;

impl domain::location::driven_ports::LocationWriter for DbLocationWriter {
    async fn bulk_save_locations(
        &self,
        location_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Acquiring database connection for location insertion.")?;
        let mut location_ids: Vec<i32> = Vec::with_capacity(location_names.len());
        let location_name_to_id_idx: HashMap<&str, usize> = HashMap::from_iter(location_names.iter().enumerate().map(|(idx, name)| (*name, idx)));
        
        for chunk in location_names.chunks(LOCATION_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new("INSERT INTO locations(location_name) VALUES ");
            
            insert_query_builder.push_values(chunk, |mut builder, location_name| {
                builder.push_bind(*location_name);
            });
            
            insert_query_builder.push(" RETURNING (id, location_name)");
            
            let inserted_data: Vec<InsertedLocationDTO> = insert_query_builder.build_query_as().fetch_all(cxn.borrow_connection()).await.context("Failed to insert locations.")?;
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!("Received {} location rows to insert, but only {} were inserted.", chunk.len(), inserted_data.len()));
            }
            
            for InsertedLocationDTO { id, location_name } in inserted_data.iter() {
                location_ids[location_name_to_id_idx[location_name.as_str()]] = *id as i32;
            }
        }
        
        Ok(location_ids)
    }

    async fn bulk_save_rooms(
        &self,
        room_refs: &[&RoomOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Acquiring database connection for room insertion.")?;
        let mut room_ids: Vec<i32> = Vec::with_capacity(room_refs.len());
        let room_ref_to_id_idx: HashMap<&RoomOnlyRef, usize> = HashMap::from_iter(room_refs.iter().enumerate().map(|(idx, room_ref)| (*room_ref, idx)));
        
        for chunk in room_refs.chunks(ROOM_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new("INSERT INTO rooms(location_id, room_name) VALUES ");
            
            insert_query_builder.push_values(chunk, |mut builder, room_ref| {
                builder.push_bind(room_ref.location_id as i16).push_bind(room_ref.name);
            });
            
            insert_query_builder.push(" RETURNING (id, location_id, room_name");
            
            let inserted_data: Vec<InsertedRoomDTO> = insert_query_builder.build_query_as().fetch_all(cxn.borrow_connection()).await.context("Failed to insert rooms.")?;
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!("Received {} room rows to insert, but only {} were inserted.", chunk.len(), inserted_data.len()));
            }
            
            for (id, room_ref) in inserted_data.iter().map(|dto| (dto.id, RoomOnlyRef::from(dto))) {
                room_ids[room_ref_to_id_idx[&room_ref]] = id;
            }
        }
        
        Ok(room_ids)
    }

    async fn bulk_save_sections(
        &self,
        section_refs: &[&SectionOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn.database_cxn().await.context("Acquiring database connection for section insertion.")?;
        let mut section_ids: Vec<i32> = Vec::with_capacity(section_refs.len());
        let section_ref_to_id_idx: HashMap<&SectionOnlyRef, usize> = HashMap::from_iter(section_refs.iter().enumerate().map(|(idx, section_ref)| (*section_ref, idx)));

        for chunk in section_refs.chunks(SECTION_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new("INSERT INTO sections(room_id, section_name) VALUES ");

            insert_query_builder.push_values(chunk, |mut builder, section_ref| {
                builder.push_bind(section_ref.room_id).push_bind(section_ref.name);
            });

            insert_query_builder.push(" RETURNING (id, room_id, section_name");

            let inserted_data: Vec<InsertedSectionDTO> = insert_query_builder.build_query_as().fetch_all(cxn.borrow_connection()).await.context("Failed to insert sections.")?;
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!("Received {} section rows to insert, but only {} were inserted.", chunk.len(), inserted_data.len()));
            }

            for (id, section_ref) in inserted_data.iter().map(|dto| (dto.id, SectionOnlyRef::from(dto))) {
                section_ids[section_ref_to_id_idx[&section_ref]] = id;
            }
        }

        Ok(section_ids)
    }
}
