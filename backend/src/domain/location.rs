pub struct Location {
    pub id: i32,
    pub name: String,
    pub room: Option<Room>,
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

#[derive(Debug)]
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
