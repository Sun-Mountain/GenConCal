
pub struct Location {
    id: i32,
    name: String,
    room: Option<Room>,
}

pub struct Room {
    id: i32,
    name: String,
    section: Option<Section>,
}

pub struct Section {
    id: i32,
    name: String,
}