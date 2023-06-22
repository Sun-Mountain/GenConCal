import { SyntheticEvent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import TabPanel from '@/components/UI/TabPanel';
import a11yProps from '@/helpers/a11yProps';

import { filterTypes } from '@/pages/_app';

const days = Object.keys(filterTypes.startDates).sort();

export default function BasicTabs() {
  const [tab, setTab] = useState(0);

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  return (
    <Box id='daily-tabs-container' sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
          {days.map((day, index) => {
            return (
              <Tab key={day} label={day} {...a11yProps(index)} />
            )
          })}
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={tab} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={tab} index={2}>
        Item Three
      </TabPanel>
    </Box>
  );
}