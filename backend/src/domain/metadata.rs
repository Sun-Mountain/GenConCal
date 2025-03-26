#![expect(dead_code)]

use crate::domain::event::IngestEvent;
use crate::domain::metadata::driven_ports::UniqueStringSaver;
use crate::external_connections::ExternalConnectivity;
use anyhow::Context;
use std::collections::HashSet;
use std::hash::Hash;

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
pub struct UniqueMetadataToSave<'incoming_data> {
    event_types: Vec<&'incoming_data str>,
    game_systems: Vec<&'incoming_data str>,
    contacts: Vec<&'incoming_data str>,
    groups: Vec<&'incoming_data str>,
    websites: Vec<&'incoming_data str>,
    materials: Vec<&'incoming_data str>,
}

impl <'ie> From<&'ie [IngestEvent]> for UniqueMetadataToSave<'ie> {
    fn from(events: &'ie[IngestEvent]) -> Self {
        let event_types: HashSet<&str> = events.iter()
            .map(|evt| evt.event_type.as_str())
            .collect();
        let game_systems: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.game_system.as_ref().map(String::as_str))
            .collect();
        let contacts: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.contact.as_ref().map(String::as_str))
            .collect();
        let groups: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.group.as_ref().map(String::as_str))
            .collect();
        let websites: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.website.as_ref().map(String::as_str))
            .collect();
        let materials: HashSet<&str> = events.iter()
            .filter_map(|evt| evt.materials.as_ref().map(String::as_str))
            .collect();
        
        Self {
            event_types: Vec::from_iter(event_types),
            game_systems: Vec::from_iter(game_systems),
            contacts: Vec::from_iter(contacts),
            groups: Vec::from_iter(groups),
            websites: Vec::from_iter(websites),
            materials: Vec::from_iter(materials),
        }
    }
}

pub struct SavedMetadata {
    pub event_types: Vec<EventType>,
    pub game_systems: Vec<GameSystem>,
    pub contacts: Vec<Contact>,
    pub groups: Vec<Group>,
    pub websites: Vec<Website>,
    pub materials: Vec<Materials>,
}

pub struct Metadata {
    pub event_type: EventType,
    pub game_system: Option<GameSystem>,
    pub materials: Option<Materials>,
    pub contact: Option<Contact>,
    pub website: Option<Website>,
    pub group: Option<Group>,
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
    metadata: UniqueMetadataToSave<'_>,
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

#[cfg(test)]
mod tests {
    use super::*;
    
    mod get_or_save_unique_str {
        use std::sync::Mutex;
        use super::*;
        
        #[tokio::test]
        async fn properly_saves_data() {
            let saver: Mutex<test_util::FakeStringSaver<i32>> = test_util::FakeStringSaver::new_locked(|saver| {
                saver.saved_strings = vec![
                    (1, "abc".to_owned()),
                    (2, "def".to_owned()),
                    (3, "ghi".to_owned()),
                ];
            });
            
            todo!();
        }
    }
}

#[cfg(test)]
pub mod test_util {
    use super::*;
    use crate::domain::test_util::Connectivity;
    use anyhow::bail;
    use std::collections::HashMap;
    use std::sync::Mutex;

    pub struct FakeStringSaver<IDType: Copy> {
        pub connectivity: Connectivity,
        pub saved_strings: Vec<(IDType, String)>,
    }

    fn assert_unique_strings(strings: &[&str]) -> Result<(), anyhow::Error> {
        let mut seen_strings: HashSet<&str> = HashSet::new();
        
        for string in strings.iter() {
            if seen_strings.contains(string) {
                bail!("String appeared multiple times: {string}");
            }
            
            seen_strings.insert(*string);
        }
        
        Ok(())
    }
    
    trait NextValue {
        fn next_val(&self) -> Self;
    }
    
    impl NextValue for i32 {
        fn next_val(&self) -> Self {
            *self + 1
        }
    }
    
    impl <IDType: Copy> FakeStringSaver<IDType> {
        pub fn new_locked(builder: impl FnOnce(&mut Self)) -> Mutex<FakeStringSaver<IDType>> {
            let mut string_saver = Self {
                connectivity: Connectivity::Connected,
                saved_strings: Vec::new(),
            };
            builder(&mut string_saver);

            Mutex::new(string_saver)
        }
    }

    impl<IDType, DomainType> UniqueStringSaver<IDType, DomainType> for Mutex<FakeStringSaver<IDType>>
    where
        IDType: Copy + Eq + Ord + NextValue + Send + Sync,
        DomainType: ConstructUniqueStr<IDType>
    {
        async fn read_matching(&self, names: &[&str], _ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<Option<DomainType>>, anyhow::Error> {
            let locked_self = self.lock().expect("Could not unlock string saver for reading");
            locked_self.connectivity.blow_up_if_disconnected()?;
            // Invariant: incoming names must be unique
            assert_unique_strings(names)?;
            
            let strings_to_ids: HashMap<&str, IDType> = locked_self.saved_strings.iter().map(|(id, saved_str)| (saved_str.as_str(), *id)).collect();
            let domain_values: Vec<Option<DomainType>> = names.iter().map(|name| {
                strings_to_ids.get(name).map(|fetched_id| {
                    DomainType::new_with_id(*fetched_id, name.to_string())
                })
            }).collect();
            
            Ok(domain_values)
        }

        async fn bulk_save(&self, new_names: &[&str], _ext_cxn: &mut impl ExternalConnectivity) -> Result<Vec<IDType>, anyhow::Error> {
            let mut locked_self = self.lock().expect("Could not unlock string saver for writing");
            locked_self.connectivity.blow_up_if_disconnected()?;
            // Invariant: incoming names must be unique
            assert_unique_strings(new_names)?;
            
            let mut next_id = locked_self.saved_strings.iter().map(|(id, _)| *id).max().unwrap().next_val();
            let mut inserted_ids: Vec<IDType> = Vec::with_capacity(new_names.len());
            
            for name in new_names.iter() {
                locked_self.saved_strings.push((next_id, name.to_string()));
                inserted_ids.push(next_id);
                next_id = next_id.next_val();
            }
            
            Ok(inserted_ids)
        }
    }
}
