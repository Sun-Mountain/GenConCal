#![expect(dead_code)]

use crate::domain::metadata::driven_ports::GameSystemReader;

pub struct GameSystem {
    pub id: i32,
    pub system_name: String,
}

pub struct Contact {
    pub id: i32,
    pub email: String,
}

pub struct Group {
    pub id: i32,
    pub name: String,
}

pub struct Website {
    pub id: i32,
    pub url: String,
}

pub struct Materials {
    pub id: i32,
    pub summary: String,
}

pub mod driven_ports {
    use crate::domain::event::GameSystem;
    use crate::external_connections::ExternalConnectivity;
    use std::mem::offset_of;

    pub trait UniqueStringSaver<IDType, DomainType>: Sync {
        async fn read_matching(
            &self,
            names: &[String],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<Option<DomainType>>, anyhow::Error>;
        async fn bulk_save(
            &self,
            new_names: &[String],
            ext_cxn: &mut impl ExternalConnectivity,
        ) -> Result<Vec<IDType>, anyhow::Error>;
    }
}


