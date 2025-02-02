#![expect(dead_code)]

use crate::domain::metadata::driven_ports::UniqueStringSaver;
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;

pub struct EventType {
    pub id: i32,
    pub name: String,
}

impl ConstructUniqueStr<i32> for EventType {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, name: value }
    }
}

pub struct GameSystem {
    pub id: i32,
    pub system_name: String,
}

impl ConstructUniqueStr<i32> for GameSystem {
    fn new_with_id(id: i32, value: String) -> Self {
        Self {
            id,
            system_name: value,
        }
    }
}

pub struct Contact {
    pub id: i32,
    pub email: String,
}

impl ConstructUniqueStr<i32> for Contact {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, email: value }
    }
}

pub struct Group {
    pub id: i32,
    pub name: String,
}

impl ConstructUniqueStr<i32> for Group {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, name: value }
    }
}

pub struct Website {
    pub id: i32,
    pub url: String,
}

impl ConstructUniqueStr<i32> for Website {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, url: value }
    }
}

pub struct Materials {
    pub id: i32,
    pub summary: String,
}

impl ConstructUniqueStr<i32> for Materials {
    fn new_with_id(id: i32, value: String) -> Self {
        Self { id, summary: value }
    }
}

#[derive(Clone)]
pub struct MetadataToSave<'incoming_data> {
    event_types: Vec<&'incoming_data str>,
    game_systems: Vec<&'incoming_data str>,
    contacts: Vec<&'incoming_data str>,
    groups: Vec<&'incoming_data str>,
    websites: Vec<&'incoming_data str>,
    materials: Vec<&'incoming_data str>,
}

pub struct SavedMetadata {
    event_types: Vec<EventType>,
    game_systems: Vec<GameSystem>,
    contacts: Vec<Contact>,
    groups: Vec<Group>,
    websites: Vec<Website>,
    materials: Vec<Materials>,
}

pub struct Metadata {
    game_system: Option<GameSystem>,
    event_type: Option<EventType>,
    materials: Option<Materials>,
    contact: Option<Contact>,
    website: Option<Website>,
    group: Option<Group>,
}

pub mod driven_ports {
    use crate::external_connections::ExternalConnectivity;

    pub trait UniqueStringSaver<IDType, DomainType>: Sync {
        async fn read_matching(
            &self,
            names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<DomainType>>, anyhow::Error>;
        async fn bulk_save(
            &self,
            new_names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<IDType>, anyhow::Error>;
    }
}

trait ConstructUniqueStr<IDType> {
    fn new_with_id(id: IDType, value: String) -> Self;
}

async fn save_or_get_unique_str<IDType: Copy, DomainType: ConstructUniqueStr<IDType>>(
    values: &[&str],
    saver: &impl UniqueStringSaver<IDType, DomainType>,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<Vec<DomainType>, anyhow::Error> {
    let mut domain_structs = saver.read_matching(values, &mut *ext_cxn).await?;
    let empty_indexes: Vec<usize> = domain_structs
        .iter()
        .enumerate()
        .filter_map(|(idx, opt)| if opt.is_none() { Some(idx) } else { None })
        .collect();

    let values_need_saving: Vec<&str> = empty_indexes.iter().map(|idx| values[*idx]).collect();
    let new_ids = saver
        .bulk_save(values_need_saving.as_ref(), &mut *ext_cxn)
        .await?;

    for (value_idx, created_id) in empty_indexes.into_iter().zip(new_ids.into_iter()) {
        domain_structs[value_idx] = Some(DomainType::new_with_id(
            created_id,
            values[value_idx].to_owned(),
        ));
    }

    // The previous loop should have filled all the Option::None entries, so this is safe
    let all_systems = domain_structs
        .into_iter()
        .collect::<Option<Vec<DomainType>>>()
        .unwrap();

    Ok(all_systems)
}

#[allow(clippy::too_many_arguments)]
pub(super) async fn save_metadata(
    metadata: MetadataToSave<'_>,
    evt_type_saver: &impl UniqueStringSaver<i32, EventType>,
    gamesys_saver: &impl UniqueStringSaver<i32, GameSystem>,
    contact_saver: &impl UniqueStringSaver<i32, Contact>,
    group_saver: &impl UniqueStringSaver<i32, Group>,
    websites_saver: &impl UniqueStringSaver<i32, Website>,
    materials_saver: &impl UniqueStringSaver<i32, Materials>,
    ext_cxn: &mut impl ExternalConnectivity,
) -> Result<SavedMetadata, anyhow::Error> {
    let event_types =
        save_or_get_unique_str(metadata.event_types.as_ref(), evt_type_saver, &mut *ext_cxn)
            .await
            .context("saving event types")?;
    let game_systems =
        save_or_get_unique_str(metadata.game_systems.as_ref(), gamesys_saver, &mut *ext_cxn)
            .await
            .context("saving game systems")?;
    let contacts = save_or_get_unique_str(metadata.contacts.as_ref(), contact_saver, &mut *ext_cxn)
        .await
        .context("saving contacts")?;
    let groups = save_or_get_unique_str(metadata.groups.as_ref(), group_saver, &mut *ext_cxn)
        .await
        .context("saving groups")?;
    let websites =
        save_or_get_unique_str(metadata.websites.as_ref(), websites_saver, &mut *ext_cxn)
            .await
            .context("saving websites")?;
    let materials =
        save_or_get_unique_str(metadata.materials.as_ref(), materials_saver, &mut *ext_cxn)
            .await
            .context("saving materials")?;

    Ok(SavedMetadata {
        event_types,
        game_systems,
        contacts,
        groups,
        websites,
        materials,
    })
}
