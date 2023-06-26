import { useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import FilterDrawerContent from '@/components/FilterDrawerContent';
import ToggleComponent from '@/components/UI/Toggle';

export default function Home () {
  // Lists
  const [ageReqList, setAgeReqList] = useState<string[]>([]);

  // Toggles
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [filterAgeReq, setFilterAgeReq] = useState<number[]>([]);

  // Filters

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
              ageReqList={ageReqList}
              setAgeReqList={setAgeReqList}
              filterAgeReq={filterAgeReq}
              setFilterAgeReq={setFilterAgeReq}
            />
          </div>
        </DrawerComponent>
      </div>
      <DailyTabs
        filterOut={[...filterAgeReq]}
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
