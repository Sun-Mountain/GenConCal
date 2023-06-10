import { ReactNode, SyntheticEvent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import TimeComponent from './DailyTimeComponent';

import { UniqueFilter } from '@/helpers/getData';

interface TabPanelProps {
  children?: ReactNode;
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

interface DailyTabs {
  allBaseFilters: number[],
  showOnly: number[],
  dateList: UniqueFilter,
  timeList: UniqueFilter
}

export default function DailyTabs({
  allBaseFilters,
  showOnly,
  dateList,
  timeList
}: DailyTabs) {
  const [tab, setTab] = useState(0);
  const dates = Object.keys(dateList).sort();
  const times = Object.keys(timeList).sort();

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const getEventsList = (date: string) => {
    const dayEvents = dateList[date]

    var eventsForDay = dayEvents.filter(val => !allBaseFilters.includes(val));

    if (showOnly.length > 0) {
      eventsForDay = eventsForDay.filter(val => showOnly.includes(val));
    };

    return eventsForDay;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example" centered>
          {dates.map((date: string, index: number) => {
            const eventCount = getEventsList(date).length.toLocaleString("en-US");
            const dateLabel = <>{date}<br />{eventCount} events</>;

            return <Tab key={date} label={dateLabel} {...a11yProps(index)} />
          })}
        </Tabs>
      </Box>
      {dates.map((date: string, index: number) => {
        const dateEvents = getEventsList(date);

        return (
          <TabPanel key={index} value={tab} index={index}>
            {times.map(time => {
              const timeEvents = timeList[time];
              const events = dateEvents.filter(val => timeEvents.includes(val));

              if (events.length > 0) {
                return (
                  <TimeComponent
                    key={time}
                    events={events}
                    time={time}
                  />
                )
              }
            })}
          </TabPanel>
        )
      })}
    </Box>
  );
}
