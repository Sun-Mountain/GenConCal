import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";
import RadioGroup from "@/components/RadioGroup";
import SliderComponent from "@/components/SliderComponent";
import Switch from "@/components/SwitchComponent";
import TimeRange from "@/components/TimeRange";

export const { eventData, filters } = getData();

export const tournamentFilterOptions = [
  'Show All Events',
  'Show Tournament Events Only',
  'Hide All Tournament Events'
]

export default function Home() {
  const filterList = filters;
  console.log(filterList);

  // Lists
  const ageRequirements = filterList.ageRequirements;
  const dateList = filterList.startDates;
  const durationLength = filterList.durationLength;
  const durationList = Object.keys(durationLength).sort();
  const eventTypes = filterList.eventTypes;
  const experienceRequirements = filterList.experienceRequirements;
  const gameSystems = filterList.gameSystems;
  const groups = filterList.groups;
  const locations = filterList.locations;
  const materialsRequired = filterList.materialsRequired;
  const soldOutEvents = filterList.noTickets;
  const startTimes = filterList.startTimes;
  const tourneyList = filterList.tournament;

  // Filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [durationFilter, setDurationFilter] = useState<number[]>([0.5, 10]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  const [eventTypeFilters, setEventTypeFilters] = useState<number[]>([]);
  const [groupFilter, setGroupFilter] = useState<number[]>([]);
  const [locationFilter, setLocationFilter] = useState<number[]>([]);
  const [earlyStartTime, setEarlyStartTime] = useState('00:00');
  const [lateStartTime, setLateStartTime] = useState('23:45');
  const [systemFilters, setSystemFilters] = useState<number[]>([]);

  // Radio Group
  const [tournamentFilter, setTournamentFilter] = useState(tournamentFilterOptions[0]);

  // Switches
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [hideMaterialsReq, setHideMaterialsReq] = useState(false);

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
        <Switch
          switchLabel={'Materials Required'}
          hide={hideMaterialsReq}
          setHide={setHideMaterialsReq}
        />
        <RadioGroup
          formLabel={'Tournament Filter'}
          options={tournamentFilterOptions}
          setValue={setTournamentFilter}
          value={tournamentFilter}
        />
        <TimeRange
          earlyStartTime={earlyStartTime}
          lateStartTime={lateStartTime}
          setEarlyStartTime={setEarlyStartTime}
          setLateStartTime={setLateStartTime}
        />
        <SliderComponent
          filterValues={durationFilter}
          setFilter={setDurationFilter}
          step={0.5}
          min={0.5}
          max={10}
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
        dateList={dateList}
        hideMaterialReq={hideMaterialsReq}
        hideSoldOut={hideSoldOut}
        materialsRequired={materialsRequired}
        soldOutEvents={soldOutEvents}
        tournamentFilter={tournamentFilter}
        tourneyList={tourneyList}
        earlyStartTime={earlyStartTime}
        lateStartTime={lateStartTime}
        startTimes={startTimes}
      />
    </main>
  )
}
