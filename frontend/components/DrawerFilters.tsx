import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

import DrawerComponent from '@/components/UI/Drawer';
import EventCategoryFilters from '@/components/EventCategoryFilters';
import TimeFilters from '@/components/TimeFilters';

import { DrawerFiltersProps } from '@/assets/interfaces';

export default function DrawerFilters ({
  handleFilter,
  ageReqList,
  xpReqList,
  eventTypeList,
  gameSystemList,
  groupsList,
  locationList,
  tournamentFilter,
  setTournamentFilter,
  earliestStartTime,
  setEarliestStartTime,
  latestStartTime,
  setLatestStartTime,
  durationFilter,
  setDurationFilter
}: DrawerFiltersProps) {
  return (
    <>
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
    </>
  )
}