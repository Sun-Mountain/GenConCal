use std::cmp::min;
use std::collections::{HashMap, HashSet};

use crate::domain;
use crate::domain::location::{LocationOnly, RoomOnly, RoomOnlyRef, SectionOnly, SectionOnlyRef};
use crate::external_connections::{ConnectionHandle, ExternalConnectivity};
use anyhow::{Context, Error, anyhow};
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
    #[tracing::instrument(skip_all, fields(first_3 = ?location_names.get(0..3), total = location_names.len()))]
    async fn read_matching_locations(
        &self,
        location_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> domain::BulkLookupResult<LocationOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read locations.")?;

        let mut seen_location_names: HashSet<&str> = HashSet::new();
        let unique_location_names: Vec<&str> = location_names
            .iter()
            .cloned()
            .filter(|name| seen_location_names.insert(*name))
            .collect();
        let mut unique_location_ids: HashMap<&str, i32> =
            HashMap::with_capacity(unique_location_names.len());

        for name in unique_location_names {
            let name_id = sqlx::query!("SELECT id FROM locations WHERE location_name = $1", name)
                .fetch_optional(cxn.borrow_connection())
                .await?;

            if let Some(record) = name_id {
                unique_location_ids.insert(name, record.id as i32);
            }
        }

        Ok(location_names
            .iter()
            .map(|name| {
                unique_location_ids
                    .get(name)
                    .map(|location_id| LocationOnly {
                        id: *location_id,
                        name: name.to_string(),
                    })
            })
            .collect())
    }

    #[tracing::instrument(skip_all, fields(first_3 = ?room_refs.get(0..3), total = room_refs.len()))]
    async fn read_matching_rooms(
        &self,
        room_refs: &[RoomOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> crate::domain::BulkLookupResult<RoomOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read rooms.")?;

        let mut seen_room_refs: HashSet<&RoomOnlyRef<'_>> = HashSet::new();
        let unique_room_refs: Vec<&RoomOnlyRef<'_>> = room_refs
            .iter()
            .filter(|key| seen_room_refs.insert(*key))
            .collect();

        let mut unique_room_ids: HashMap<&RoomOnlyRef<'_>, i32> =
            HashMap::with_capacity(unique_room_refs.len());

        for room_ref in unique_room_refs {
            let name_id = sqlx::query!(
                "SELECT id FROM rooms WHERE room_name = $1 AND location_id = $2",
                room_ref.name,
                room_ref.location_id as i16,
            )
            .fetch_optional(cxn.borrow_connection())
            .await?;

            if let Some(record) = name_id {
                unique_room_ids.insert(room_ref, record.id);
            }
        }

        Ok(room_refs
            .iter()
            .map(|room_ref| {
                unique_room_ids.get(room_ref).map(|room_id| RoomOnly {
                    id: *room_id,
                    location_id: room_ref.location_id,
                    name: room_ref.name.to_string(),
                })
            })
            .collect())
    }

    #[tracing::instrument(skip_all, fields(first_3 = ?section_refs.get(0..3), total = section_refs.len()))]
    async fn read_matching_sections(
        &self,
        section_refs: &[SectionOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> crate::domain::BulkLookupResult<SectionOnly, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection to read sections.")?;

        let mut seen_section_refs: HashSet<&SectionOnlyRef<'_>> = HashSet::new();
        let unique_section_refs: Vec<&SectionOnlyRef<'_>> = section_refs
            .iter()
            .filter(|key| seen_section_refs.insert(*key))
            .collect();

        let mut unique_section_ids: HashMap<&SectionOnlyRef<'_>, i32> =
            HashMap::with_capacity(unique_section_refs.len());

        for section_ref in unique_section_refs {
            let name_id = sqlx::query!(
                "SELECT id FROM sections WHERE section_name = $1 AND room_id = $2",
                section_ref.name,
                section_ref.room_id,
            )
            .fetch_optional(cxn.borrow_connection())
            .await?;

            if let Some(record) = name_id {
                unique_section_ids.insert(section_ref, record.id);
            }
        }

        Ok(section_refs
            .iter()
            .map(|section_ref| {
                unique_section_ids
                    .get(section_ref)
                    .map(|section_id| SectionOnly {
                        id: *section_id,
                        room_id: section_ref.room_id,
                        name: section_ref.name.to_string(),
                    })
            })
            .collect())
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

impl<'dto> From<&'dto InsertedRoomDTO> for RoomOnlyRef<'dto> {
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

impl<'dto> From<&'dto InsertedSectionDTO> for SectionOnlyRef<'dto> {
    fn from(dto: &'dto InsertedSectionDTO) -> Self {
        SectionOnlyRef {
            room_id: dto.room_id,
            name: dto.section_name.as_str(),
        }
    }
}

pub struct DbLocationWriter;

impl domain::location::driven_ports::LocationWriter for DbLocationWriter {
    #[tracing::instrument(skip_all, fields(first_3 = ?location_names.get(0..3), total = location_names.len()))]
    async fn bulk_save_locations(
        &self,
        location_names: &[&str],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection for location insertion.")?;
        let mut seen_location_names: HashSet<&str> = HashSet::new();
        let unique_location_names: Vec<&str> = location_names
            .iter()
            .cloned()
            .filter(|name| seen_location_names.insert(*name))
            .collect();
        let mut location_name_to_id: HashMap<String, i32> = HashMap::new();

        let mut inserted_data: Vec<InsertedLocationDTO> = Vec::with_capacity(min(
            LOCATION_INSERT_CHUNK_SIZE,
            unique_location_names.len() / LOCATION_INSERT_PARAMS,
        ));
        for chunk in unique_location_names.chunks(LOCATION_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO locations(location_name)");

            insert_query_builder.push_values(chunk, |mut builder, location_name| {
                builder.push_bind(*location_name);
            });

            insert_query_builder.push(" RETURNING id, location_name");

            inserted_data.extend(
                insert_query_builder
                    .build_query_as()
                    .fetch_all(cxn.borrow_connection())
                    .await
                    .context("Failed to insert locations.")?,
            );
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!(
                    "Received {} location rows to insert, but only {} were inserted.",
                    chunk.len(),
                    inserted_data.len()
                ));
            }

            for InsertedLocationDTO { id, location_name } in inserted_data.iter() {
                location_name_to_id.insert(location_name.clone(), *id as i32);
            }
            inserted_data.clear();
        }

        Ok(location_names
            .iter()
            .map(|name| {
                *location_name_to_id
                    .get(&name.to_string())
                    .expect("All inserted data should have an associated ID")
            })
            .collect())
    }

    #[tracing::instrument(skip_all, fields(first_3 = ?room_refs.get(0..3), total = room_refs.len()))]
    async fn bulk_save_rooms(
        &self,
        room_refs: &[&RoomOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection for room insertion.")?;
        let mut seen_rooms: HashSet<&RoomOnlyRef<'_>> = HashSet::new();
        let mut room_ref_to_id: HashMap<(i32, String), i32> = HashMap::new();
        let unique_rooms: Vec<&RoomOnlyRef<'_>> = room_refs
            .iter()
            .cloned()
            .filter(|key| seen_rooms.insert(*key))
            .collect();

        let mut inserted_data: Vec<InsertedRoomDTO> = Vec::with_capacity(min(
            ROOM_INSERT_CHUNK_SIZE,
            unique_rooms.len() / ROOM_INSERT_PARAMS,
        ));
        for chunk in unique_rooms.chunks(ROOM_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO rooms(location_id, room_name)");

            insert_query_builder.push_values(chunk, |mut builder, room_ref| {
                builder
                    .push_bind(room_ref.location_id as i16)
                    .push_bind(room_ref.name);
            });

            insert_query_builder.push(" RETURNING id, location_id, room_name");

            inserted_data.extend(
                insert_query_builder
                    .build_query_as()
                    .fetch_all(cxn.borrow_connection())
                    .await
                    .context("Failed to insert rooms.")?,
            );
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!(
                    "Received {} room rows to insert, but only {} were inserted.",
                    chunk.len(),
                    inserted_data.len()
                ));
            }

            for inserted_data in inserted_data.iter() {
                room_ref_to_id.insert(
                    (
                        inserted_data.location_id as i32,
                        inserted_data.room_name.clone(),
                    ),
                    inserted_data.id,
                );
            }
        }

        Ok(room_refs
            .iter()
            .map(|room_ref| {
                *room_ref_to_id
                    .get(&(room_ref.location_id, room_ref.name.to_string()))
                    .expect("All inserted data should have an associated ID")
            })
            .collect())
    }

    #[tracing::instrument(skip_all, fields(first_3 = ?section_refs.get(0..3), total = section_refs.len()))]
    async fn bulk_save_sections(
        &self,
        section_refs: &[&SectionOnlyRef<'_>],
        ext_cxn: &mut impl ExternalConnectivity,
    ) -> Result<Vec<i32>, Error> {
        let mut cxn = ext_cxn
            .database_cxn()
            .await
            .context("Acquiring database connection for section insertion.")?;
        let mut seen_sections: HashSet<&SectionOnlyRef<'_>> = HashSet::new();
        let mut section_ref_to_id: HashMap<(i32, String), i32> = HashMap::new();
        let unique_sections: Vec<&SectionOnlyRef<'_>> = section_refs
            .iter()
            .cloned()
            .filter(|key| seen_sections.insert(*key))
            .collect();

        let mut inserted_data: Vec<InsertedSectionDTO> = Vec::with_capacity(min(
            SECTION_INSERT_CHUNK_SIZE,
            unique_sections.len() / SECTION_INSERT_PARAMS,
        ));
        for chunk in unique_sections.chunks(SECTION_INSERT_CHUNK_SIZE) {
            let mut insert_query_builder: sqlx::QueryBuilder<Postgres> =
                sqlx::QueryBuilder::new("INSERT INTO sections(room_id, section_name)");

            insert_query_builder.push_values(chunk, |mut builder, section_ref| {
                builder
                    .push_bind(section_ref.room_id)
                    .push_bind(section_ref.name);
            });

            insert_query_builder.push(" RETURNING id, room_id, section_name");

            inserted_data.extend(
                insert_query_builder
                    .build_query_as()
                    .fetch_all(cxn.borrow_connection())
                    .await
                    .context("Failed to insert sections.")?
            );
            if inserted_data.len() != chunk.len() {
                return Err(anyhow!(
                    "Received {} section rows to insert, but only {} were inserted.",
                    chunk.len(),
                    inserted_data.len()
                ));
            }

            for inserted_data in inserted_data.iter() {
                section_ref_to_id.insert(
                    (
                        inserted_data.room_id,
                        inserted_data.section_name.clone(),
                    ),
                    inserted_data.id,
                );
            }
            inserted_data.clear();
        }

        Ok(section_refs
            .iter()
            .map(|section_ref| {
                *section_ref_to_id
                    .get(&(section_ref.room_id, section_ref.name.to_string()))
                    .expect("All inserted data should have an associated ID")
            })
            .collect())
    }
}
