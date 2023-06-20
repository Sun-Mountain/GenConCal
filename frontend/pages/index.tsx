import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";
import RadioGroup from "@/components/RadioGroup";
import Switch from "@/components/SwitchComponent";
import TimeRange from "@/components/TimeRange";

import { ChoiceFilter } from "@/interfaces/Components";

export const { eventData, filters } = getData();

export const tournamentFilterOptions = [
  'Show All Events',
  'Show Tournament Events Only',
  'Hide All Tournament Events'
]

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
  const materialsRequired = filterList.materialsRequired;
  const soldOutEvents = filterList.noTickets;
  const startTimes = filterList.startTimes;
  const tourneyList = filterList.tournament;

  // Filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
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

  // Choices
  const [choices, setChoices] = useState<number[]>([]);
  const [choiceFilter, setChoiceFilter] = useState<ChoiceFilter[]>([])

  const removeFilter = (eventIndex: number) => {
    for (let i=0; i < choiceFilter.length; i++) {
        if (choiceFilter[i].id === eventIndex) {
            choiceFilter.splice(i, 1);
            break;
        }
    }
  }

  const handleChoice = (eventIndex: number, choiceAction: string) => {
    switch (choiceAction) {
      case 'add':
        const {
          startDate,
          startTime,
          endDate,
          endTime
        } = eventData[eventIndex];
        var newEvent = [eventIndex],
            newFilter = [{
              id: eventIndex,
              startDate: startDate,
              startTime: startTime,
              endDate: endDate,
              endTime: endTime
            }];
        setChoices([...choices, ...newEvent]);
        setChoiceFilter([...choiceFilter, ...newFilter]);
        break;
      case 'remove':
        var index = choices.indexOf(eventIndex);
        choices.splice(index, 1);
        setChoices([...choices]);
        removeFilter(eventIndex);
        break;
    }
  };
  console.log(choiceFilter)

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
        hideMaterialReq={hideMaterialsReq}
        handleChoice={handleChoice}
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
