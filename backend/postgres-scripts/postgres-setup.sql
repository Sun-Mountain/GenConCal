CREATE TABLE gencon_years (
    year SMALLINT PRIMARY KEY NOT NULL
);

CREATE TABLE locations (
    id SMALLSERIAL PRIMARY KEY,
    location_name VARCHAR(64) NOT NULL
);

COMMENT ON TABLE locations IS
    'Table containing unique buildings where GenCon events occur.';

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    location_id SMALLINT NOT NULL,
    room_name VARCHAR(255) NOT NULL,

    CONSTRAINT rooms_location_id_fk
                   FOREIGN KEY (location_id)
                   REFERENCES locations(id)
);

COMMENT ON TABLE rooms IS
    'Table containing individual rooms of buildings listed in the locations table.';

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    section_name VARCHAR(255) NOT NULL,

    CONSTRAINT sections_room_id_fk
                      FOREIGN KEY (room_id)
                      REFERENCES rooms(id)
);

COMMENT ON TABLE sections IS
    'Table containing sections of larger rooms (e.g. ballrooms) where GenCon events can occur';

CREATE TABLE game_systems (
    id BIGSERIAL PRIMARY KEY,
    system_name TEXT NOT NULL
);

CREATE TABLE game_masters (
    id BIGSERIAL PRIMARY KEY,
    gm_name VARCHAR(512) NOT NULL
);

CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    contact_email VARCHAR(128) NOT NULL
);

CREATE TABLE websites (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL
);

CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(128) NOT NULL
);

CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL
);

CREATE TABLE tournaments (
    id BIGSERIAL PRIMARY KEY,
    tournament_name TEXT NOT NULL,
    total_rounds SMALLINT NOT NULL
);

CREATE TABLE tournament_segment (
    tournament_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    round_number SMALLINT NOT NULL,

    CONSTRAINT tournament_segment_tournament_id_fk
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id),
    CONSTRAINT tournament_segment_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
);

CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    sommary VARCHAR(512)
);

CREATE TYPE AGEREQUIREMENT AS ENUM ('Everyone', 'KidsOnly', 'Teen', 'Mature', 'Adult');
CREATE TYPE EXPERIENCEREQUIREMENT AS ENUM ('None', 'Some', 'Expert');

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    game_id varchar(128),

    game_system_id BIGINT NOT NULL,
    event_type_id INT NOT NULL,
    age_requirement AGEREQUIREMENT NOT NULL,
    required_experience EXPERIENCEREQUIREMENT NOT NULL,
    table_number SMALLINT NULL DEFAULT NULL,
    materials_id BIGINT NULL DEFAULT NULL,
    contact_id BIGINT NULL DEFAULT NULL,
    website_id BIGINT NULL DEFAULT NULL,
    group_id BIGINT NULL DEFAULT NULL,

    title VARCHAR(512) NOT NULL,
    description TEXT NOT NULL,

    start_dt TIMESTAMP WITH TIME ZONE NOT NULL,
    end_dt TIMESTAMP WITH TIME ZONE NOT NULL,
    year SMALLINT NOT NULL,
    cost INT NULL DEFAULT NULL,
    tickets_available SMALLINT NOT NULL,
    min_players SMALLINT NOT NULL,
    max_players SMALLINT NOT NULL,

    CONSTRAINT events_game_system_id_fk
        FOREIGN KEY (game_system_id)
        REFERENCES game_systems(id),
    CONSTRAINT events_event_type_id_fk
        FOREIGN KEY (event_type_id)
        REFERENCES event_types(id),
    CONSTRAINT events_materials_id_fk
        FOREIGN KEY (materials_id)
        REFERENCES materials(id),
    CONSTRAINT events_contact_id_fk
        FOREIGN KEY (contact_id)
        REFERENCES contacts(id),
    CONSTRAINT events_website_id_fk
        FOREIGN KEY (website_id)
        REFERENCES websites(id),
    CONSTRAINT events_group_id_fk
        FOREIGN KEY (group_id)
        REFERENCES groups(id),
    CONSTRAINT events_gencon_year_fk
        FOREIGN KEY (year)
        REFERENCES gencon_years(year)
);

CREATE TABLE event_location (
    location_id SMALLINT NOT NULL,
    event_id BIGINT NOT NULL,

    CONSTRAINT event_location_location_id_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id),
    CONSTRAINT event_location_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE TABLE event_room (
    room_id INT NOT NULL,
    event_id BIGINT NOT NULL,

    CONSTRAINT event_room_room_id_fk
        FOREIGN KEY (room_id)
        REFERENCES rooms(id),
    CONSTRAINT event_room_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE TABLE event_section (
    section_id INT NOT NULL,
    event_id BIGINT NOT NULL,
    
    CONSTRAINT event_section_section_id_fk
       FOREIGN KEY (section_id)
       REFERENCES sections(id),
    CONSTRAINT event_section_event_id_fk
       FOREIGN KEY (event_id)
       REFERENCES events(id)
       ON DELETE CASCADE
);

CREATE TABLE event_game_masters (
    gm_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    
    CONSTRAINT event_game_masters_gm_id_fk
        FOREIGN KEY (gm_id)
        REFERENCES game_masters(id)
        ON DELETE CASCADE,
    CONSTRAINT event_game_masters_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE FUNCTION trg_enforce_unique_location_join()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$func$
BEGIN
    DELETE FROM event_room
    WHERE event_room.event_id IN (
        SELECT DISTINCT new_locations.event_id FROM new_locations
    );

    DELETE FROM event_section
    WHERE event_section.event_id IN (
        SELECT DISTINCT new_locations.event_id FROM new_locations
    );
END;
$func$;

CREATE TRIGGER enforce_unique_location_join
AFTER INSERT ON event_location
REFERENCING NEW TABLE AS new_locations
FOR EACH STATEMENT
EXECUTE PROCEDURE trg_enforce_unique_location_join();


CREATE FUNCTION trg_enforce_unique_room_join()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$func$
BEGIN
    DELETE FROM event_location
    WHERE event_location.event_id IN (
        SELECT DISTINCT new_rooms.event_id FROM new_rooms
    );

    DELETE FROM event_section
    WHERE event_section.event_id IN (
        SELECT DISTINCT new_rooms.event_id FROM new_rooms
    );
END;
$func$;

CREATE TRIGGER enforce_unique_room_join
    AFTER INSERT ON event_room
    REFERENCING NEW TABLE AS new_rooms
    FOR EACH STATEMENT
EXECUTE PROCEDURE trg_enforce_unique_room_join();

CREATE FUNCTION trg_enforce_unique_section_join()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$func$
BEGIN
    DELETE FROM event_location
    WHERE event_location.event_id IN (
        SELECT DISTINCT new_sections.event_id FROM new_sections
    );

    DELETE FROM event_room
    WHERE event_room.event_id IN (
        SELECT DISTINCT new_sections.event_id FROM new_sections
    );
END;
$func$;

CREATE TRIGGER enforce_unique_section_join
    AFTER INSERT ON event_section
    REFERENCING NEW TABLE AS new_sections
    FOR EACH STATEMENT
    EXECUTE PROCEDURE trg_enforce_unique_section_join();
