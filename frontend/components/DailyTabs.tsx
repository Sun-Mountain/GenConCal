import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

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

interface DateList {
  [index: string]: Array<number>
}

interface DailyTabs {
  dateList: DateList
}

export default function DailyTabs({
  dateList
}: DailyTabs) {
  const [tab, setTab] = React.useState(0);
  const dates = Object.keys(dateList).sort();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example" centered>
          {dates.map((date: string, index: number) => {
            const eventCount = dateList[date].length.toLocaleString("en-US");
            const dateLabel = <>{date}<br />{eventCount} events</>;

            return <Tab key={date} label={dateLabel} {...a11yProps(index)} />
          })}
        </Tabs>
      </Box>
      {dates.map((date: string, index: number) => {
        const dateEvents = dateList[date];

        return (
          <TabPanel key={index} value={tab} index={index}>
            {dateEvents.map((date: number, index: number) => {
              return (<div key={index}>{date}</div>)
            })}
          </TabPanel>
        )
      })}
    </Box>
  );
}
