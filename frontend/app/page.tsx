'use client'
import { Suspense, useState } from "react";

import getData from "@/helpers/getData";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function Home() {
  const {eventData, filters} = getData();
  const filterList = filters;

  const dateList = filterList.startDates;
  const dates = Object.keys(dateList).sort();
  const timeList = filterList.startTimes;
  const times = Object.keys(timeList).sort();

  const [choices, setChoices] = useState([]);
  const [eventList, setEventList] = useState(eventData);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [tab, setTab] = useState(0);

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <main>
      <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
        {dates.map((date, index) => {
          return <Tab key={date} label={date} {...a11yProps(index)} />
        })}
      </Tabs>
      {dates.map((date, dateIndex) => {
        const dateEvents = dateList[date]
        return (
          <TabPanel
            key={dateIndex}
            value={tab}
            index={dateIndex}
          >
            {times.map((time, timeIndex) => {
              const timeEvents = timeList[time]
              const filteredEvents = dateEvents.filter(value => timeEvents.includes(value));
              return (
                <div key={timeIndex}>
                  {filteredEvents}
                </div>
              )
            })}
          </TabPanel>
        )
      })}
    </main>
  )
}
