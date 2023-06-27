import { Suspense, SyntheticEvent, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import TabPanel from '@/components/UI/TabPanel';
import a11yProps from '@/helpers/a11yProps';

import { filteredEvents } from '@/pages/_app';
import { DailyTabsTypes } from '@/assets/interfaces';
import DataTable from './UI/DataTable';

const eventsListByDay = filteredEvents.startDates;
const eventsListByStartTime = filteredEvents.startTimes;
const soldOutEvents = filteredEvents.noTickets;
const tournamentEvents = filteredEvents.tournaments;
const durationList = filteredEvents.duration;
const durationKeys = Object.keys(durationList).sort();
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function DailyTabs({
  durationFilter,
  earliestStartTime,
  latestStartTime,
  filterFor,
  filterOut,
  hideSoldOut,
  tournamentFilter
}: DailyTabsTypes) {
  const [tab, setTab] = useState(0);
  const lowestDuration = durationFilter[0];
  const highestDuration = durationFilter[1];

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  const getEvents = (day: string) => {
    const dayEvents = eventsListByDay[day]
    var eventsForDay = dayEvents;

    if (Number(durationKeys[0]) != lowestDuration || Number(durationKeys[durationKeys.length - 1]) != highestDuration) {
      durationKeys.map(key => {
        if (Number(key) < lowestDuration){
          var events = durationList[key]
          eventsForDay = eventsForDay.filter(val => !events.includes(val));
        }
        if (Number(key) > highestDuration){
          var events = durationList[key]
          eventsForDay = eventsForDay.filter(val => !events.includes(val));
        }
      })
    }

    if (hideSoldOut) {
      eventsForDay = eventsForDay.filter(val => !soldOutEvents.includes(val))
    }

    if (filterFor.length) {
      eventsForDay = eventsForDay.filter(val => filterFor.includes(val))
    }

    if (filterOut.length) {
      eventsForDay = eventsForDay.filter(val => !filterOut.includes(val))
    }

    if (tournamentFilter === 'hide') {
      eventsForDay = eventsForDay.filter(val => !tournamentEvents.includes(val))
    }

    if (tournamentFilter === 'show') {
      eventsForDay = eventsForDay.filter(val => tournamentEvents.includes(val))
    }

    timeLabels.map(timeLabel => {
      if (timeLabel < earliestStartTime || timeLabel > latestStartTime) {
        var events = eventsListByStartTime[timeLabel]
        eventsForDay = eventsForDay.filter(val => !events.includes(val));
      }
    })

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
                    <DataTable events={events} />
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