import { ChangeEvent, useEffect, useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import FilterDrawerContent from '@/components/FilterDrawerContent';
import ToggleComponent from '@/components/UI/Toggle';
import { FilterProps } from '@/assets/interfaces';

import { filteredEvents } from './_app';

export const eventFilters = Object.keys(filteredEvents).sort();
const ageRequirementKeys = Object.keys(filteredEvents.ageRequirement);
const expRequirementKeys = Object.keys(filteredEvents.experienceType);

export default function Home () {
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [ageReqFilter, setAgeReqFilter] = useState<FilterProps>({})
  const [expReqFilter, setExpReqFilter] = useState<FilterProps>({})
  
  useEffect(() => {
    ageRequirementKeys.map(key => {
      ageReqFilter[key] = true
    });
    setAgeReqFilter(ageReqFilter);
    expRequirementKeys.map(key => {
      expReqFilter[key] = true
    })
    setExpReqFilter(expReqFilter);
  }, [ageReqFilter, expReqFilter])

  return (
    <>
      <div id='filters-container'>
        <ToggleComponent
          switchLabel='Sold Out Events'
          hide={hideSoldOut}
          setHide={setHideSoldOut}
        />
        <DrawerComponent>
          <div id='filter-drawer-content-wrapper'>
            <FilterDrawerContent
              ageReqFilter={ageReqFilter}
              setAgeReqFilter={setAgeReqFilter}
              expReqFilter={expReqFilter}
            />
          </div>
        </DrawerComponent>
      </div>
      <DailyTabs
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
