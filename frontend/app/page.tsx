'use client'

import { useState } from "react";

import getData from "@/helpers/getData";

import DailyTabs from "@/components/DailyTabs";

export default function Home() {
  const {eventData, filters} = getData();
  const filterList = filters;

  const dateList = filterList.startDates;
  const timeList = filterList.startTimes;
  const times = Object.keys(timeList).sort();

  const [choices, setChoices] = useState([]);
  const [eventList, setEventList] = useState(eventData);
  const [filteredEvents, setFilteredEvents] = useState([]);

  return (
    <main>
      <DailyTabs dateList={dateList} />
    </main>
  )
}
