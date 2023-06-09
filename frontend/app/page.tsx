'use client'

import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterButtons from "@/components/FilterButtons";

export default function Home() {
  const {eventData, filters} = getData();
  const filterList = filters;

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
      <DailyTabs
        allBaseFilters={[
          ...ageFilters,
          ...experienceFilters
        ]}
        dateList={dateList}
        timeList={timeList}
      />
    </main>
  )
}
