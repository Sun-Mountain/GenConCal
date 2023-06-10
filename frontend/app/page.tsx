'use client'

import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";

export default function Home() {
  const {eventData, filters} = getData();
  const filterList = filters;
  console.log(filterList);

  const [choices, setChoices] = useState([]);

  // Dates and times
  const dateList = filterList.startDates;
  const timeList = filterList.startTimes;

  // Basic filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  // Buttons
  const ageRequirements = filterList.ageRequirements;
  const experienceRequirements = filterList.experienceRequirements;

  // Multi filters
  const [eventTypeFilters, setEventTypeFilters] = useState<number[]>([]);
  const [systemFilters, setSystemFilters] = useState<number[]>([]);
  // Lists
  const eventTypes = filterList.eventTypes;
  const gameSystems = filterList.gameSystems;

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
      <DailyTabs
        allBaseFilters={[
          ...ageFilters,
          ...experienceFilters
        ]}
        showOnly={[
          ...eventTypeFilters,
          ...systemFilters
        ]}
        dateList={dateList}
        timeList={timeList}
      />
    </main>
  )
}
