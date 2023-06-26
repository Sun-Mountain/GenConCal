import { Dispatch, SetStateAction, useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import FilterDrawerContent from '@/components/FilterDrawerContent';
import ToggleComponent from '@/components/UI/Toggle';

import { filteredEvents } from './_app';
import filterOutHelper from '@/helpers/filterOut';

const ageReqMasterList = filteredEvents.ageRequirement;
const xpReqMasterList = filteredEvents.experienceType;

export default function Home () {
  // Lists
  const [ageReqList, setAgeReqList] = useState<string[]>([]);
  const [xpReqList, setXPReqList] = useState<string[]>([]);

  // Toggles
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [ageReqFilter, setAgeReqFilter] = useState<number[]>([]);
  const [xpFilter, setXPFilter] = useState<number[]>([]);

  const handleFilter = (
    groupLabel: string,
    label: string
  ) => {
    switch (groupLabel) {
      case 'Age Requirement':
        filterOutHelper(ageReqMasterList,
                      ageReqFilter,
                      setAgeReqFilter,
                      label,
                      ageReqList,
                      setAgeReqList)
        break;
      case 'Experience Requirement':
        filterOutHelper(xpReqMasterList,
                      xpFilter,
                      setXPFilter,
                      label,
                      xpReqList,
                      setXPReqList)
        break;
      default:
        console.log('ERROR');
        break;
    }
  }

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
              handleFilter={handleFilter}
              ageReqList={ageReqList}
              xpReqList={xpReqList}
            />
          </div>
        </DrawerComponent>
      </div>
      <DailyTabs
        filterOut={[...ageReqFilter, ...xpFilter]}
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
