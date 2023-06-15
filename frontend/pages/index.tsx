import { Dispatch, SetStateAction, useEffect, useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";
import Switch from "@/components/SwitchComponent";
import TimeRange from "@/components/TimeRange";

export const { eventData, filters } = getData();

export default function Home() {
  const filterList = filters;

  // Dates and times
  const dateList = filterList.startDates;
  const timesAndEvents = filterList.startTimes;
  const soldOutEvents = filterList.noTickets;
  const allTimeLabels = Object.keys(timesAndEvents).sort();
  const [timeLabels, setTimeLabels] = useState(allTimeLabels);
  const [timeFilter, setTimeFilter] = useState(timesAndEvents);
  const [filteredEvents, setFilteredEvents] = useState<number[]>([]);

  // Basic filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  // Buttons
  const ageRequirements = filterList.ageRequirements;
  const experienceRequirements = filterList.experienceRequirements;

  // Switches
  const [hideSoldOut, setHideSoldOut] = useState(false);

  // Multi filters
  const [eventTypeFilters, setEventTypeFilters] = useState<number[]>([]);
  const [groupFilter, setGroupFilter] = useState<number[]>([]);
  const [locationFilter, setLocationFilter] = useState<number[]>([]);
  const [systemFilters, setSystemFilters] = useState<number[]>([]);
  // Lists
  const eventTypes = filterList.eventTypes;
  const gameSystems = filterList.gameSystems;
  const groups = filterList.groups;
  const locations = filterList.locations;

  return (
    <main>
      <FilterButtons
        filter={ageRequirements}
        filterFor={ageFilters}
        setFilterFor={setAgeFilters}
        groupLabel={'Age Requirements'}
      />
      <FilterButtons
        filter={experienceRequirements}
        filterFor={experienceFilters}
        setFilterFor={setExperienceFilters}
        groupLabel={'Experience Requirements'}
      />
      <FilterAutoList
        filter={eventTypes}
        setFilterFor={setEventTypeFilters}
        label={'Event Type'}
      />
      <FilterAutoList
        filter={gameSystems}
        setFilterFor={setSystemFilters}
        label={'Game System'}
      />
      <FilterAutoList
        filter={groups}
        setFilterFor={setGroupFilter}
        label={'Company / Group'}
      />
      <FilterAutoList
        filter={locations}
        setFilterFor={setLocationFilter}
        label={'Location'}
      />
      <Switch
        switchLabel={'Sold Out Events'}
        hide={hideSoldOut}
        setHide={setHideSoldOut}
      />
      <TimeRange
        setFilteredEvents={setFilteredEvents}
        timesAndEvents={timesAndEvents}
        setTimeFilter={setTimeFilter}
        setTimeLabels={setTimeLabels}
      />
      <DailyTabs
        allBaseFilters={[
          ...ageFilters,
          ...experienceFilters
        ]}
        showOnly={[
          eventTypeFilters,
          systemFilters,
          groupFilter,
          locationFilter
        ]}
        dateList={dateList}
        filteredEvents={filteredEvents}
        hideSoldOut={hideSoldOut}
        soldOutEvents={soldOutEvents}
        timeFilter={timeFilter}
        timeLabels={timeLabels}
      />
    </main>
  )
}
