import { Suspense, SyntheticEvent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';

const EventListing = dynamic(() => import("./EventListing"), {
  loading: () => <b>Loading...</b>,
});

import { tournamentFilterOptions } from '@/pages';

import TimeCollectionHeader from '@/components/TimeCollectionHeader';
import { DailyTabs, TabPanelProps } from '@/interfaces/Components';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Suspense>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <>
            {children}
          </>
        )}
      </div>
    </Suspense>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function DailyTabs({
  allBaseFilters,
  showOnly,
  choices,
  dateList,
  hideMaterialReq,
  handleChoice,
  hideSoldOut,
  materialsRequired,
  soldOutEvents,
  tournamentFilter,
  tourneyList,
  earlyStartTime,
  lateStartTime,
  startTimes
}: DailyTabs) {
  const dates = Object.keys(dateList).sort();
  const timeLabels = Object.keys(startTimes).sort();
  const [tab, setTab] = useState(0);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const getChoices = (date: string) => {
    const dayEvents = dateList[date];
    return dayEvents.filter(val => choices.includes(val));
  } 

  const getEventsList = (date: string) => {
    const dayEvents = dateList[date]

    var eventsForDay = dayEvents.filter(val => !allBaseFilters.includes(val));

    if (hideMaterialReq) {
      eventsForDay = eventsForDay.filter(val => !materialsRequired.includes(val));
    }

    if (hideSoldOut) {
      eventsForDay = eventsForDay.filter(val => !soldOutEvents.includes(val));
    }

    if (tournamentFilter === tournamentFilterOptions[1]) {
      eventsForDay = eventsForDay.filter(val => tourneyList.includes(val))
    }

    if (tournamentFilter === tournamentFilterOptions[2]) {
      eventsForDay = eventsForDay.filter(val => !tourneyList.includes(val))
    }

    timeLabels.map(timeLabel => {
      if (timeLabel < earlyStartTime || timeLabel > lateStartTime) {
        var events = startTimes[timeLabel]
        eventsForDay = eventsForDay.filter(val => !events.includes(val));
      }
    })

    showOnly.map(array => {
      if (array.length > 0) {
        eventsForDay = eventsForDay.filter(val => array.includes(val));
      }
    })

    return eventsForDay;
  }

  return (
    <Box className='tabs-container' sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant='scrollable'
          aria-label="basic tabs example"
        >
          {dates.map((date: string, index: number) => {
            const dateEvents = getEventsList(date);
            const eventCount = dateEvents.length;
            const dateLabel = <>{date}<br />{eventCount.toLocaleString("en-US")} events</>;

            return <Tab key={date} label={dateLabel} {...a11yProps(index)} />
          })}
        </Tabs>
      </Box>
      {dates.map((date: string, index: number) => {
        const dateChoices = getChoices(date);
        const dateEvents = getEventsList(date);

        return (
          <TabPanel key={index} value={tab} index={index}>
            <Suspense>
              {dateChoices.length ? (
                <div>
                  {dateChoices.map((eventIndex: number) => {
                    return (
                      <Suspense key={eventIndex}>
                        <TimeCollectionHeader />
                        <EventListing
                          key={eventIndex}
                          eventIndex={eventIndex}
                          handleChoice={handleChoice}
                          type='choice'
                        />
                      </Suspense>
                    )
                  })}
                </div>
              ) : (
                <div>
                  No choices.
                </div>
              )}
            </Suspense>
            <hr />
            {timeLabels.map(time => {
              if (time >= earlyStartTime || time <= lateStartTime) {
                const events = dateEvents.filter(val => startTimes[time].includes(val))

                if (events.length) {
                    return (
                      <div key={time}>
                        <h2 className="time-title">
                          {time}
                        </h2>
                        <div className="event-list">
                          <TimeCollectionHeader />
                          {events.map((eventIndex: number) => {
                            return (
                              <Suspense key={eventIndex}>
                                <EventListing
                                  key={eventIndex}
                                  eventIndex={eventIndex}
                                  handleChoice={handleChoice}
                                  type='list'
                                />
                              </Suspense>
                            )
                          })}
                        </div>
                      </div>
                    )
                }
              }
            })}
          </TabPanel>
        )
      })}
    </Box>
  );
}
