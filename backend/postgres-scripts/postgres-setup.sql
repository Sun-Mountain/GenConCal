CREATE TABLE gencon_years (
    year SMALLINT PRIMARY KEY NOT NULL
);

COMMENT ON TABLE gencon_years IS
    'Table containing individual years when a GenCon event occurred. This allows us to keep historical records of events and operate on the basis of the current year under normal conditions';

CREATE TABLE locations (
    id SMALLSERIAL PRIMARY KEY,
    location_name VARCHAR(64) NOT NULL,

    CONSTRAINT locations_location_name_uk UNIQUE (location_name)
);

COMMENT ON TABLE locations IS
    'Table containing unique buildings where GenCon events occur.';

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    location_id SMALLINT NOT NULL,
    room_name VARCHAR(255) NOT NULL,

    CONSTRAINT rooms_location_id_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id),
    CONSTRAINT rooms_location_id_room_name_uk UNIQUE (location_id, room_name)
);

COMMENT ON TABLE rooms IS
    'Table containing individual rooms of buildings listed in the locations table.';

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    section_name VARCHAR(255) NOT NULL,

    CONSTRAINT sections_room_id_fk
        FOREIGN KEY (room_id)
        REFERENCES rooms(id),
    CONSTRAINT sections_room_id_section_name_uk UNIQUE (room_id, section_name)
);

COMMENT ON TABLE sections IS
    'Table containing sections of larger rooms (e.g. ballrooms) where GenCon events can occur';

CREATE TABLE game_systems (
    id BIGSERIAL PRIMARY KEY,
    system_name TEXT NOT NULL,

    CONSTRAINT game_systems_system_name_uk UNIQUE (system_name)
);

COMMENT ON TABLE game_systems IS
    'Table containing unique game systems which can be referenced by events';

CREATE TABLE game_masters (
    id BIGSERIAL PRIMARY KEY,
    gm_name VARCHAR(512) NOT NULL,

    CONSTRAINT game_masters_gm_name_uk UNIQUE (gm_name)
);

COMMENT ON TABLE game_masters IS
    'Table containing names of individuals running events at GenCon. Multiple GMs may run the same event.';

CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    contact_email VARCHAR(128) NOT NULL,

    CONSTRAINT contacts_contact_email_uk UNIQUE (contact_email)
);

COMMENT ON TABLE contacts IS
    'Table containing contact e-mail addresses associated with each event. Note that this could be PII, so treat with care';

CREATE TABLE websites (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,

    CONSTRAINT websites_url_uk UNIQUE (url)
);

COMMENT ON TABLE websites IS
    'Table containing unique URLs that can be associated with each event, potentially for the individual or organization''s homepage';

CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(128) NOT NULL,

    CONSTRAINT groups_group_name_uk UNIQUE (group_name)
);

COMMENT ON TABLE groups IS
    'Table containing the unique names of organizing groups for GenCon events';

CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,

    CONSTRAINT event_types_event_type_uk UNIQUE (event_type)
);

COMMENT ON TABLE event_types IS
    'Table containing different categories that GenCon events fall into';


CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    summary VARCHAR(512),

    CONSTRAINT materials_summary_uk UNIQUE (summary)
);

COMMENT ON TABLE materials IS
    'Table containing unique descriptions of necessary materials for events';

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
        REFERENCES gencon_years(year),

    CONSTRAINT events_game_id_uk UNIQUE (game_id),

    CONSTRAINT events_start_dt_end_dt_ordering_chk CHECK (start_dt <= end_dt),
    CONSTRAINT events_player_count_chk CHECK (min_players < max_players),
    CONSTRAINT events_cost_validity_chk CHECK (cost IS NULL OR cost > 0),
    CONSTRAINT events_positive_ticket_count_chk CHECK (tickets_available >= 0),
    CONSTRAINT events_title_has_content_chk CHECK (length(title) > 0)
);

COMMENT ON TABLE events IS
    'Central table representing a single event at GenCon. Each event is considered unique on the basis of the Game ID assigned by GenCon staffers.';

COMMENT ON COLUMN events.game_id IS
    'Unique alphanumeric event ID assigned by GenCon organizers. It follows a predictable pattern - (3 letter event type) + (last 2 numbers of year) + ND + (6 digit incrementing event number)';

CREATE TABLE tournaments (
     id BIGSERIAL PRIMARY KEY,
     tournament_name TEXT NOT NULL,
     gencon_year INT NOT NULL,
     total_rounds SMALLINT NOT NULL,

     CONSTRAINT tournaments_tournament_name_gencon_year_uk UNIQUE (tournament_name, gencon_year),
     CONSTRAINT tournaments_gencon_year_fk
         FOREIGN KEY (gencon_year)
         REFERENCES gencon_years(year)
);

COMMENT ON TABLE tournaments IS
    'Table containing high-level tournament descriptions which may consist of multiple rounds, each containing events that comprise the tournament.';

CREATE TABLE tournament_segment (
    tournament_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    round_number SMALLINT NOT NULL,

    CONSTRAINT tournament_segment_tournament_id_fk
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id),
    CONSTRAINT tournament_segment_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id),
    CONSTRAINT tournament_segment_fully_unique UNIQUE (tournament_id, event_id, round_number)
);

COMMENT ON TABLE tournament_segment IS
    'Contains individual segments of overarching event tournaments which reference the events that make up a round of a tournament.';
CREATE TABLE event_location (
    location_id SMALLINT NOT NULL,
    event_id BIGINT NOT NULL,

    CONSTRAINT event_location_location_id_fk
        FOREIGN KEY (location_id)
        REFERENCES locations(id),
    CONSTRAINT event_location_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,
    CONSTRAINT event_location_all_fields_unique_key UNIQUE (location_id, event_id)
);

COMMENT ON TABLE event_location IS
    'Join table for events which are stated to only occur within a specific building. The join for location will only happen in this table, event_room, or event_section, not a combination';

CREATE TABLE event_room (
    room_id INT NOT NULL,
    event_id BIGINT NOT NULL,

    CONSTRAINT event_room_room_id_fk
        FOREIGN KEY (room_id)
        REFERENCES rooms(id),
    CONSTRAINT event_room_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,
    CONSTRAINT event_room_all_fields_unique_key UNIQUE (room_id, event_id)
);

COMMENT ON TABLE event_room IS
    'Join table for events which are stated to occur within a specific room of a building. The join for location will only happen in this table, event_location, or event_section, not a combination';

CREATE TABLE event_section (
    section_id INT NOT NULL,
    event_id BIGINT NOT NULL,
    
    CONSTRAINT event_section_section_id_fk
        FOREIGN KEY (section_id)
        REFERENCES sections(id),
    CONSTRAINT event_section_event_id_fk
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,
    CONSTRAINT event_section_all_fields_unique_key UNIQUE (section_id, event_id)
);

COMMENT ON TABLE event_section IS
    'Join table for events which are stated to occur within a specific section of a room in a building. The join for location will only happen in this table, event_location, or event_room, not a combination';

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
        ON DELETE CASCADE,
    CONSTRAINT event_game_masters_all_fields_unique_key UNIQUE (gm_id, event_id)
);

COMMENT ON TABLE event_game_masters IS
    'Join table matching unique game masters to events. It is possible for multiple game masters to be running the same event, and it is possible for one game master to run multiple events.';

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

COMMENT ON FUNCTION trg_enforce_unique_location_join IS
    'Triggered on inserts into the event_location table. Removes location entries for matching events from the other two location join tables to enforce a single join across exactly one of the tables.';

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

COMMENT ON FUNCTION trg_enforce_unique_room_join IS
    'Triggered on inserts into the event_room table. Removes location entries for matching events from the other two location join tables to enforce a single join across exactly one of the tables.';

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

COMMENT ON FUNCTION trg_enforce_unique_section_join IS
    'Triggered on inserts into the event_section table. Removes location entries for matching events from the other two location join tables to enforce a single join across exactly one of the tables.';

CREATE TRIGGER enforce_unique_section_join
    AFTER INSERT ON event_section
    REFERENCING NEW TABLE AS new_sections
    FOR EACH STATEMENT
    EXECUTE PROCEDURE trg_enforce_unique_section_join();
