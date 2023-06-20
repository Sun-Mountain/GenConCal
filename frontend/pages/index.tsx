import { MouseEvent, useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";
import Switch from "@/components/SwitchComponent";
import TimeRange from "@/components/TimeRange";

export const { eventData, filters } = getData();

export default function Home() {
  const filterList = filters;

  // Lists
  const ageRequirements = filterList.ageRequirements;
  const dateList = filterList.startDates;
  const eventTypes = filterList.eventTypes;
  const experienceRequirements = filterList.experienceRequirements;
  const gameSystems = filterList.gameSystems;
  const groups = filterList.groups;
  const locations = filterList.locations;
  const soldOutEvents = filterList.noTickets;
  const startTimes = filterList.startTimes;

  // Filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  const [eventTypeFilters, setEventTypeFilters] = useState<number[]>([]);
  const [groupFilter, setGroupFilter] = useState<number[]>([]);
  const [locationFilter, setLocationFilter] = useState<number[]>([]);
  const [earlyStartTime, setEarlyStartTime] = useState('00:00');
  const [lateStartTime, setLateStartTime] = useState('23:45');
  const [systemFilters, setSystemFilters] = useState<number[]>([]);

  // Switches
  const [hideSoldOut, setHideSoldOut] = useState(false);

  // Choices
  const [choices, setChoices] = useState<number[]>([]);

  const handleChoice = (eventIndex: number) => {
    var newEvent = [eventIndex]
    setChoices([...choices, ...newEvent]);
  };

  return (
    <main>
      <div id="filters-container">
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
        <div id="filter-list-container">
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
        </div>
        <Switch
          switchLabel={'Sold Out Events'}
          hide={hideSoldOut}
          setHide={setHideSoldOut}
        />
        <TimeRange
          earlyStartTime={earlyStartTime}
          lateStartTime={lateStartTime}
          setEarlyStartTime={setEarlyStartTime}
          setLateStartTime={setLateStartTime}
        />
      </div>
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
        choices={choices}
        dateList={dateList}
        handleChoice={handleChoice}
        hideSoldOut={hideSoldOut}
        soldOutEvents={soldOutEvents}
        earlyStartTime={earlyStartTime}
        lateStartTime={lateStartTime}
        startTimes={startTimes}
      />
    </main>
  )
}
