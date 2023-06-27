import { useState } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

import DailyTabs from '@/components/DailyTabs';
import DrawerComponent from '@/components/UI/Drawer';
import EventCategoryFilters from '@/components/EventCategoryFilters';
import ToggleComponent from '@/components/UI/Toggle';

<<<<<<< HEAD
import { filteredEvents } from './_app';
import filterOutHelper from '@/helpers/filterOut';
import filterForHelper from '@/helpers/filterFor';
import TimeFilters from '@/components/TimeFilters';

const ageReqMasterList = filteredEvents.ageRequirement;
const xpReqMasterList = filteredEvents.experienceType;
const eventTypeMasterList = filteredEvents.eventTypes;
const gameSystemMasterList = filteredEvents.gameSystems;
const groupsMasterList = filteredEvents.groups;
const locationMasterList = filteredEvents.locations;
=======
import DailyTabs from "@/components/DailyTabs";
import FilterAutoList from "@/components/FilterAutoList";
import FilterButtons from "@/components/FilterButtons";
import RadioGroup from "@/components/RadioGroup";
import SliderComponent from "@/components/SliderComponent";
import Switch from "@/components/SwitchComponent";
import TimeRange from "@/components/TimeRange";

export const { eventData, filters } = getData();

export const tournamentFilterOptions = [
  'Show All Events',
  'Show Tournament Events Only',
  'Hide All Tournament Events'
]

export default function Home() {
  const filterList = filters;
>>>>>>> 1121cd00143d5578b0e87973b6b5698da48b0656

export default function Home () {
  // Lists
<<<<<<< HEAD
  const [ageReqList, setAgeReqList] = useState<string[]>([]);
  const [xpReqList, setXPReqList] = useState<string[]>([]);
  const [eventTypeList, setEventTypeList] = useState<string[]>([]);
  const [gameSystemList, setGameSystemList] = useState<string[]>([]);
  const [groupsList, setGroupsList] = useState<string[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);

  // Filters
=======
  const ageRequirements = filterList.ageRequirements;
  const dateList = filterList.startDates;
  const durationLength = filterList.durationLength;
  const eventTypes = filterList.eventTypes;
  const experienceRequirements = filterList.experienceRequirements;
  const gameSystems = filterList.gameSystems;
  const groups = filterList.groups;
  const locations = filterList.locations;
  const materialsRequired = filterList.materialsRequired;
  const soldOutEvents = filterList.noTickets;
  const startTimes = filterList.startTimes;
  const tourneyList = filterList.tournament;

  // Filters
  const [ageFilters, setAgeFilters] = useState<number[]>([]);
  const [durationFilter, setDurationFilter] = useState<number[]>([0.5, 10]);
  const [experienceFilters, setExperienceFilters] = useState<number[]>([]);
  const [eventTypeFilters, setEventTypeFilters] = useState<number[]>([]);
  const [groupFilter, setGroupFilter] = useState<number[]>([]);
  const [locationFilter, setLocationFilter] = useState<number[]>([]);
  const [earlyStartTime, setEarlyStartTime] = useState('00:00');
  const [lateStartTime, setLateStartTime] = useState('23:45');
  const [systemFilters, setSystemFilters] = useState<number[]>([]);

  // Radio Group
  const [tournamentFilter, setTournamentFilter] = useState(tournamentFilterOptions[0]);

  // Switches
>>>>>>> 1121cd00143d5578b0e87973b6b5698da48b0656
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
  const [durationFilter, setDurationFilter] = useState([0.5, 10])
  
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
<<<<<<< HEAD
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
              <TimeFilters
                earliestStartTime={earliestStartTime}
                setEarliestStartTime={setEarliestStartTime}
                latestStartTime={latestStartTime}
                setLatestStartTime={setLatestStartTime}
                durationFilter={durationFilter}
                setDurationFilter={setDurationFilter}
              />
            </div>
          </DrawerComponent>
        </div>
      </div>
      <DailyTabs
        durationFilter={durationFilter}
        earliestStartTime={earliestStartTime}
        latestStartTime={latestStartTime}
        filterFor={[...eventTypeFilter,
                    ...gameSystemFilter,
                    ...groupsFilter,
                    ...locationFilter]}
        filterOut={[...ageReqFilter, ...xpFilter]}
=======
        <Switch
          switchLabel={'Materials Required'}
          hide={hideMaterialsReq}
          setHide={setHideMaterialsReq}
        />
        <RadioGroup
          formLabel={'Tournament Filter'}
          options={tournamentFilterOptions}
          setValue={setTournamentFilter}
          value={tournamentFilter}
        />
        <TimeRange
          earlyStartTime={earlyStartTime}
          lateStartTime={lateStartTime}
          setEarlyStartTime={setEarlyStartTime}
          setLateStartTime={setLateStartTime}
        />
        <SliderComponent
          label={'Event Duration (in Hours)'}
          filterValues={durationFilter}
          setFilter={setDurationFilter}
          step={0.5}
          min={0.5}
          max={10}
        />
      </div>
      <DailyTabs
        allBaseFilters={[
          ...ageFilters,
          ...experienceFilters
        ]}
        showOnly={[
          eventTypeFilters,
          systemFilters,
          groupFilter,
          locationFilter
        ]}
        dateList={dateList}
        durationFilter={durationFilter}
        durationLength={durationLength}
        hideMaterialReq={hideMaterialsReq}
>>>>>>> 1121cd00143d5578b0e87973b6b5698da48b0656
        hideSoldOut={hideSoldOut}
        tournamentFilter={tournamentFilter}
      />
    </>
  )
}
