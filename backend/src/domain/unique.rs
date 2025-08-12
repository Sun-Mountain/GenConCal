use crate::external_connections::ExternalConnectivity;
use driven_ports::UniqueStringSaver;

pub mod driven_ports {
    use crate::external_connections::ExternalConnectivity;

    /// Port for reading/saving unique string-backed domain records (e.g., names, URLs).
    pub trait UniqueStringSaver<IDType, DomainType>: Sync {
        /// Returns existing domain objects for each input name (None if missing).
        async fn read_matching(
            &self,
            names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<DomainType>>, anyhow::Error>;
        /// Persists any new names and returns their generated IDs in input order.
        async fn bulk_save(
            &self,
            new_names: &[&str],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<IDType>, anyhow::Error>;
    }
}

/// Helper for constructing domain objects from an ID and its unique string value.
pub trait ConstructUniqueStr<IDType> {
    /// Creates a new domain object instance with the generated ID and original string value.
    fn new_with_id(id: IDType, value: String) -> Self;
}

#[tracing::instrument(skip_all, fields(first_5 = ?values.get(0..5), total = values.len()))]
/// Reads existing unique strings and creates any missing ones, returning domain objects in input order.
pub async fn save_or_get_unique_str<IDType: Copy, DomainType: ConstructUniqueStr<IDType>>(
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
    let all_strs = domain_structs
        .into_iter()
        .collect::<Option<Vec<DomainType>>>()
        .unwrap();

    Ok(all_strs)
}

#[cfg(test)]
mod tests {
    use super::*;

    mod get_or_save_unique_str {
        use super::*;
        use crate::domain::test_util::Connectivity;
        use crate::domain::unique::test_util::UniqueStr;
        use crate::domain::unique::{save_or_get_unique_str, test_util};
        use crate::{external_connections, persistence};
        use speculoos::prelude::*;
        use std::sync::Mutex;

        #[tokio::test]
        async fn properly_saves_data() {
            let saver: Mutex<test_util::FakeStringSaver<i64>> =
                test_util::FakeStringSaver::new_locked(|saver| {
                    saver.saved_strings = vec![
                        (1, "abc".to_owned()),
                        (2, "def".to_owned()),
                        (3, "ghi".to_owned()),
                    ];
                });
            let mut ext_cxn = external_connections::test_util::FakeExternalConnectivity::new();
            let new_strs = ["def", "jkl", "abc"];
            let expected_result = [
                UniqueStr {
                    id: 2,
                    value: "def".to_owned(),
                },
                UniqueStr {
                    id: 4,
                    value: "jkl".to_owned(),
                },
                UniqueStr {
                    id: 1,
                    value: "abc".to_owned(),
                },
            ];
            let expected_state = [
                (1, "abc".to_owned()),
                (2, "def".to_owned()),
                (3, "ghi".to_owned()),
                (4, "jkl".to_owned()),
            ];
            let new_contacts_result: Result<Vec<UniqueStr>, _> =
                save_or_get_unique_str(&new_strs, &saver, &mut ext_cxn).await;

            let data_state = saver.lock().unwrap();
            assert_eq!(
                &expected_result,
                new_contacts_result
                    .expect("Saving unique strings failed")
                    .as_slice()
            );
            assert_eq!(expected_state, data_state.saved_strings.as_slice());
        }

        #[tokio::test]
        async fn reports_error_properly() {
            let saver: Mutex<test_util::FakeStringSaver<i64>> =
                test_util::FakeStringSaver::new_locked(|saver| {
                    saver.connectivity = Connectivity::Disconnected;
                });
            let mut ext_cxn = external_connections::test_util::FakeExternalConnectivity::new();
            let new_strs = ["def", "jkl", "abc"];

            let new_contacts_result: Result<Vec<UniqueStr>, _> =
                save_or_get_unique_str(&new_strs, &saver, &mut ext_cxn).await;

            assert_that!(new_contacts_result).is_err();
        }
    }
}

#[cfg(test)]
pub mod test_util {
    use crate::domain::test_util::Connectivity;
    use crate::domain::unique::ConstructUniqueStr;
    use crate::domain::unique::driven_ports::UniqueStringSaver;
    use crate::external_connections::ExternalConnectivity;
    use anyhow::bail;
    use std::collections::{HashMap, HashSet};
    use std::sync::Mutex;

    #[derive(Debug, PartialEq, Eq)]
    /// Test-only domain object representing a unique string with an ID.
    pub struct UniqueStr {
        pub id: i64,
        pub value: String,
    }

    impl ConstructUniqueStr<i64> for UniqueStr {
        fn new_with_id(id: i64, value: String) -> Self {
            Self { id, value }
        }
    }

    /// In-memory fake UniqueStringSaver used in tests; stores saved strings and simulates connectivity.
    pub struct FakeStringSaver<IDType: Copy> {
        pub connectivity: Connectivity,
        pub saved_strings: Vec<(IDType, String)>,
    }

    /// Ensures all strings in the slice are unique; returns an error if any duplicates are found.
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

    /// Test helper trait for incrementing ID-like numeric types.
    trait NextValue {
        /// Returns the next sequential value.
        fn next_val(&self) -> Self;
    }

    impl NextValue for i32 {
        fn next_val(&self) -> Self {
            *self + 1
        }
    }

    impl NextValue for i64 {
        fn next_val(&self) -> Self {
            *self + 1
        }
    }

    impl<IDType: Copy> FakeStringSaver<IDType> {
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
        DomainType: ConstructUniqueStr<IDType>,
    {
        async fn read_matching(
            &self,
            names: &[&str],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<DomainType>>, anyhow::Error> {
            let locked_self = self
                .lock()
                .expect("Could not unlock string saver for reading");
            locked_self.connectivity.blow_up_if_disconnected()?;
            // Invariant: incoming names must be unique
            assert_unique_strings(names)?;

            let strings_to_ids: HashMap<&str, IDType> = locked_self
                .saved_strings
                .iter()
                .map(|(id, saved_str)| (saved_str.as_str(), *id))
                .collect();
            let domain_values: Vec<Option<DomainType>> = names
                .iter()
                .map(|name| {
                    strings_to_ids
                        .get(name)
                        .map(|fetched_id| DomainType::new_with_id(*fetched_id, name.to_string()))
                })
                .collect();

            Ok(domain_values)
        }

        async fn bulk_save(
            &self,
            new_names: &[&str],
            _ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<IDType>, anyhow::Error> {
            let mut locked_self = self
                .lock()
                .expect("Could not unlock string saver for writing");
            locked_self.connectivity.blow_up_if_disconnected()?;
            // Invariant: incoming names must be unique
            assert_unique_strings(new_names)?;

            let mut next_id = locked_self
                .saved_strings
                .iter()
                .map(|(id, _)| *id)
                .max()
                .unwrap()
                .next_val();
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
