import { useState } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import EventCategoryFilters from '@/components/EventCategoryFilters';
import ToggleComponent from '@/components/UI/Toggle';

import { filteredEvents } from './_app';
import filterOutHelper from '@/helpers/filterOut';
import filterForHelper from '@/helpers/filterFor';

const ageReqMasterList = filteredEvents.ageRequirement;
const xpReqMasterList = filteredEvents.experienceType;
const eventTypeMasterList = filteredEvents.eventTypes;
const gameSystemMasterList = filteredEvents.gameSystems;
const groupsMasterList = filteredEvents.groups;
const locationMasterList = filteredEvents.locations;

export default function Home () {
  console.log(filteredEvents)
  // Lists
  const [ageReqList, setAgeReqList] = useState<string[]>([]);
  const [xpReqList, setXPReqList] = useState<string[]>([]);
  const [eventTypeList, setEventTypeList] = useState<string[]>([]);
  const [gameSystemList, setGameSystemList] = useState<string[]>([]);
  const [groupsList, setGroupsList] = useState<string[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);

  // Filters
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [ageReqFilter, setAgeReqFilter] = useState<number[]>([]);
  const [xpFilter, setXPFilter] = useState<number[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<number[]>([]);
  const [gameSystemFilter, setGameSystemFilter] = useState<number[]>([]);
  const [groupsFilter, setGroupsFilter] = useState<number[]>([]);
  const [locationFilter, setLocationFilter] = useState<number[]>([]);
  const [tournamentFilter, setTournamentFilter] = useState<'' | 'hide' | 'show'>('');
  
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
      case 'Company / Group':
        if (labelList) {
          await filterForHelper(groupsMasterList,
                            setGroupsFilter,
                            labelList,
                            setGroupsList)
        }
        break;
      case 'Locations':
        if (labelList) {
          await filterForHelper(locationMasterList,
                            setLocationFilter,
                            labelList,
                            setLocationList)
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
          <DrawerComponent icon={<FilterAltIcon />} buttonText='Filter By Event Category'>
            <div id='filter-drawer-content-wrapper'>
              <EventCategoryFilters
                handleFilter={handleFilter}
                ageReqList={ageReqList}
                xpReqList={xpReqList}
                eventTypeList={eventTypeList}
                gameSystemList={gameSystemList}
                groupsList={groupsList}
                locationList={locationList}
                tournamentFilter={tournamentFilter}
                setTournamentFilter={setTournamentFilter}
              />
            </div>
          </DrawerComponent>
        </div>
        <div className='drawer-container'>
          <DrawerComponent icon={<AccessTimeFilledIcon />} buttonText='Filter By Time'>
            <div id='filter-drawer-content-wrapper'>
              Time Filters
            </div>
          </DrawerComponent>
        </div>
      </div>
      <DailyTabs
        filterFor={[...eventTypeFilter,
                    ...gameSystemFilter,
                    ...groupsFilter,
                    ...locationFilter]}
        filterOut={[...ageReqFilter, ...xpFilter]}
        tournamentFilter={tournamentFilter}
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
