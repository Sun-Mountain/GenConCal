import { Dispatch, SetStateAction, useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import FilterDrawerContent from '@/components/FilterDrawerContent';
import ToggleComponent from '@/components/UI/Toggle';

import { filteredEvents } from './_app';
import filterOutHelper from '@/helpers/filterOut';
import filterForHelper from '@/helpers/filterFor';

const ageReqMasterList = filteredEvents.ageRequirement;
const xpReqMasterList = filteredEvents.experienceType;
const eventTypeMasterList = filteredEvents.eventTypes;
const gameSystemMasterList = filteredEvents.gameSystems;

export default function Home () {
  console.log(filteredEvents)
  // Lists
  const [ageReqList, setAgeReqList] = useState<string[]>([]);
  const [xpReqList, setXPReqList] = useState<string[]>([]);
  const [eventTypeList, setEventTypeList] = useState<string[]>([]);
  const [gameSystemList, setGameSystemList] = useState<string[]>([]);

  // Filters
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [ageReqFilter, setAgeReqFilter] = useState<number[]>([]);
  const [xpFilter, setXPFilter] = useState<number[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<number[]>([]);
  const [gameSystemFilter, setGameSystemFilter] = useState<number[]>([]);

  const handleFilter = async ({
    groupLabel,
    label,
    labelList
  }: {
    groupLabel: string;
    label?: string;
    labelList?: string[];
  }) => {
    switch (groupLabel) {
      case 'Age Requirement':
        if (label) {
          await filterOutHelper(ageReqMasterList,
                        ageReqFilter,
                        setAgeReqFilter,
                        label,
                        ageReqList,
                        setAgeReqList)
        }
        break;
      case 'Experience Requirement':
        if (label) {
          await filterOutHelper(xpReqMasterList,
                        xpFilter,
                        setXPFilter,
                        label,
                        xpReqList,
                        setXPReqList)
        }
        break;
      case 'Event Types':
        if (labelList) {
          await filterForHelper(eventTypeMasterList,
                            setEventTypeFilter,
                            labelList,
                            setEventTypeList)
        }
        break;
      case 'Game Systems':
        if (labelList) {
          await filterForHelper(gameSystemMasterList,
                            setGameSystemFilter,
                            labelList,
                            setGameSystemList)
        }
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
        <div className='drawer-container'>
          <DrawerComponent>
            <div id='filter-drawer-content-wrapper'>
              <FilterDrawerContent
                handleFilter={handleFilter}
                ageReqList={ageReqList}
                xpReqList={xpReqList}
                eventTypeList={eventTypeList}
                gameSystemList={gameSystemList}
              />
            </div>
          </DrawerComponent>
        </div>
      </div>
      <DailyTabs
        filterFor={[...eventTypeFilter, ...gameSystemFilter]}
        filterOut={[...ageReqFilter, ...xpFilter]}
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
