import { useState } from 'react';

import { filteredEvents } from './_app';
import filterOutHelper from '@/helpers/filterOut';
import filterForHelper from '@/helpers/filterFor';
import findEvent from '@/helpers/findEvent';

import DailyTabs from '@/components/DailyTabs';
import DrawerFilters from '@/components/DrawerFilters';
import EventCard from '@/components/UI/EventCard';
import PopoverButton from '@/components/UI/PopOverButton';
import ToggleComponent from '@/components/UI/Toggle';
import { HomePageProps } from '@/assets/interfaces';
import Favorites from '@/components/Favorites';

const ageReqMasterList = filteredEvents.ageRequirement;
const xpReqMasterList = filteredEvents.experienceType;
const eventTypeMasterList = filteredEvents.eventTypes;
const gameSystemMasterList = filteredEvents.gameSystems;
const groupsMasterList = filteredEvents.groups;
const locationMasterList = filteredEvents.locations;

export default function Home ({ faves, setFaves }: HomePageProps) {
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
  const [earliestStartTime, setEarliestStartTime] = useState<string>('00:00');
  const [latestStartTime, setLatestStartTime] = useState<string>('23:45');
  const [durationFilter, setDurationFilter] = useState([0.5, 10]);

  // Favorites
  const [numOfFaves, setNumOfFaves] = useState(faves.length);
  
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

  const includesFave = (eventIndex: number) => {
    return faves.includes(eventIndex) ? true : false;
  }

  const handleFaves = async (eventIndex: number) => {
    var newFaves = faves;
    if (includesFave(eventIndex)) {
      var index = newFaves.indexOf(eventIndex);
      newFaves.splice(index, 1);
    } else {
      newFaves.push(eventIndex);
    }
    setFaves(newFaves)
    await setNumOfFaves(newFaves.length);
  }

  return (
    <>
      <div id='filters-container'>
        <ToggleComponent
          switchLabel='Sold Out Events'
          hide={hideSoldOut}
          setHide={setHideSoldOut}
        />
        <DrawerFilters
          handleFilter={handleFilter}
          ageReqList={ageReqList}
          xpReqList={xpReqList}
          eventTypeList={eventTypeList}
          gameSystemList={gameSystemList}
          groupsList={groupsList}
          locationList={locationList}
          tournamentFilter={tournamentFilter}
          setTournamentFilter={setTournamentFilter}
          earliestStartTime={earliestStartTime}
          setEarliestStartTime={setEarliestStartTime}
          latestStartTime={latestStartTime}
          setLatestStartTime={setLatestStartTime}
          durationFilter={durationFilter}
          setDurationFilter={setDurationFilter}
        />
        <Favorites faves={faves} handleFaves={handleFaves} />
      </div>
      <DailyTabs
        durationFilter={durationFilter}
        earliestStartTime={earliestStartTime}
        latestStartTime={latestStartTime}
        handleFaves={handleFaves}
        includesFave={includesFave}
        filterFor={[...eventTypeFilter,
          ...gameSystemFilter,
          ...groupsFilter,
          ...locationFilter]}
        filterOut={[...ageReqFilter, ...xpFilter]}
        hideSoldOut={hideSoldOut}
        tournamentFilter={tournamentFilter}
      />
    </>
  )
}
