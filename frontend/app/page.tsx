'use client'

import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterButtons from "@/components/FilterButtons";

import { filterEvents } from "@/interfaces/filterEvents";

export default function Home() {
  const {eventData, eventIndexes, filters} = getData();
  const filterList = filters;
  const allEvents = eventIndexes;

  const [choices, setChoices] = useState([]);

  // Dates and times
  const dateList = filterList.startDates;
  const timeList = filterList.startTimes;
  const times = Object.keys(timeList).sort();

  // Basic filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  // Buttons
  const ageRequirements = filterList.ageRequirements;
  const experienceRequirements = filterList.experienceRequirements;

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
      <DailyTabs dateList={dateList} />
    </main>
  )
}
