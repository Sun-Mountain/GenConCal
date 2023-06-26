import { Suspense, SyntheticEvent, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import TabPanel from '@/components/UI/TabPanel';
import a11yProps from '@/helpers/a11yProps';

import { filterTypes } from '@/pages/_app';
import { DailyTabsTypes, CountObj, UniqueFilter } from '@/assets/interfaces';
import DataTable from './UI/DataTable';

const eventsListByDay = filterTypes.startDates;
const eventsListByStartTime = filterTypes.startTimes;
const soldOutEvents = filterTypes.noTickets;
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function DailyTabs({
  hideSoldOut
}: DailyTabsTypes) {
  const [tab, setTab] = useState(0);

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  const getEvents = (day: string) => {
    const dayEvents = eventsListByDay[day]
    var eventsForDay = dayEvents;

    if (hideSoldOut) {
      eventsForDay = eventsForDay.filter(val => !soldOutEvents.includes(val))
    }

    return eventsForDay;
  }

  return (
    <Box id='daily-tabs-container' sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          value={tab}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {dayLabels.map((day, index) => {
            var eventsForDay = getEvents(day),
                eventNum = (eventsForDay.length).toLocaleString(),
                dateLabel = (<div className='tab-label'>
                  <div className='tab-date'>{day}</div>
                  <div className='tab-count'>{eventNum} events</div>
                </div>)
            return (
              <Tab key={day} label={dateLabel} {...a11yProps(index)} />
            )
          })}
        </Tabs>
      </Box>
      {dayLabels.map((day, index) => {
        var eventsForDay = getEvents(day)
        return (
          <TabPanel key={index} value={tab} index={index}>
            {timeLabels.map(time => {
              const events = eventsForDay.filter(val => eventsListByStartTime[time].includes(val))

              if (events.length) {
                return (
                  <div key={time}>
                    <h3>{time}</h3>
                    <Suspense>
                      <DataTable events={events} />
                    </Suspense>
                  </div>
                )
              }
            })}
          </TabPanel>
        )
      })}
    </Box>
  );
}