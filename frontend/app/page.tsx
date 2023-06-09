'use client'

import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";
import FilterButtons from "@/components/FilterButtons";

export default function Home() {
  const {eventData, eventIndexes, filters} = getData();
  const filterList = filters;

  console.log(eventIndexes);

  const [choices, setChoices] = useState([]);
  const [eventList, setEventList] = useState(eventData);
  const [filterEvents, setFilterEvents] = useState(eventIndexes);

  // Dates and times
  const dateList = filterList.startDates;
  const timeList = filterList.startTimes;
  const times = Object.keys(timeList).sort();

  // Basic filters
  // Buttons
  const ageRequirements = filterList.ageRequirements;
  const experienceRequirements = filterList.experienceRequirements;

  return (
    <main>
      <FilterButtons
        filter={ageRequirements}
        filterEvents={filterEvents}
        setFilterEvents={setFilterEvents}
        groupLabel={'Age Requirements'}
      />
      <FilterButtons
        filter={experienceRequirements}
        filterEvents={filterEvents}
        setFilterEvents={setFilterEvents}
        groupLabel={'Experience Requirements'}
      />
      <DailyTabs dateList={dateList} />
    </main>
  )
}
