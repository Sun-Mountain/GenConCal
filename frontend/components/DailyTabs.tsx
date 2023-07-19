import { SyntheticEvent, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

import { filteredEvents } from '@/pages/_app';

import { DailyTabsTypes } from '@/assets/interfaces';
import { DataTable, TabPanel } from '@/components';
import a11yProps from '@/helpers/a11yProps';

const {
  duration: durationList,
  noTickets: soldOutEvents,
  startDates: eventsListByDay,
  startTimes: eventsListByStartTime,
  tournaments: tournamentEvents
} = filteredEvents;
const durationKeys = Object.keys(durationList).sort();
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function DailyTabs({
  durationFilter,
  earliestStartTime,
  latestStartTime,
  handleFaves,
  includesFave,
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

        if (eventsForDay.length === 0) {
          return (
            <TabPanel key={index} value={tab} index={index}>
              <div key={index} className='no-events'>
                There are no events that match the criteria for this day.
              </div>
            </TabPanel>
          )
        }

        return (
          <TabPanel key={index} value={tab} index={index}>
            {timeLabels.map(time => {
              const events = eventsForDay.filter(val => eventsListByStartTime[time].includes(val))

              if (events.length) {
                return (
                  <div key={time}>
                    <h3>{time}</h3>
                    <DataTable
                      events={events}
                      handleFaves={handleFaves}
                      includesFave={includesFave} />
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