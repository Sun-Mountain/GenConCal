import { filteredEvents } from "@/pages/_app";
import { FilterDrawerProps } from "@/assets/interfaces";
import { AutoCompleteMultiple, ButtonGroup, RadioButtonsGroup } from '@/components';

export function EventCategoryFilters ({
  handleFilter,
  ageReqList,
  xpReqList,
  eventTypeList,
  gameSystemList,
  groupsList,
  locationList,
  tournamentFilter,
  setTournamentFilter
}: FilterDrawerProps) {
  const ageLabels = [ 'kids only (12 and under)',
                      'Everyone (6+)',
                      'Teen (13+)',
                      'Mature (18+)',
                      '21+' ]
  const xpLabels = Object.keys(filteredEvents.experienceType)
  const eventTypeLabels = Object.keys(filteredEvents.eventTypes).sort()
  const gameSystemLabels = Object.keys(filteredEvents.gameSystems).sort()
  const groupLabels = Object.keys(filteredEvents.groups).sort()
  const locationLabels = Object.keys(filteredEvents.locations).sort()
  const tournamentOptions = [ { value: 'hide', choiceLabel: 'Hide Tournaments' },
                              { value: 'show', choiceLabel: 'Only Show Tournaments' } ]

  return (
    <div className="filter-content">
      <div className="content-group button-groups">
        <ButtonGroup
          groupLabel="Age Requirement"
          hiddenList={ageReqList}
          handleFilter={handleFilter}
          labels={ageLabels}
        /><br />
        <ButtonGroup
          groupLabel="Experience Requirement"
          hiddenList={xpReqList}
          handleFilter={handleFilter}
          labels={xpLabels}
        />
      </div>
      <div className="content-group">
        <strong>Filter By:</strong>
        <AutoCompleteMultiple
          groupLabel='Event Types'
          hiddenList={eventTypeList}
          handleFilter={handleFilter}
          labels={eventTypeLabels}
        />
        <AutoCompleteMultiple
          groupLabel='Game Systems'
          hiddenList={gameSystemList}
          handleFilter={handleFilter}
          labels={gameSystemLabels}
        />
        <AutoCompleteMultiple
          groupLabel='Company / Group'
          hiddenList={groupsList}
          handleFilter={handleFilter}
          labels={groupLabels}
        />
        <AutoCompleteMultiple
          groupLabel='Locations'
          hiddenList={locationList}
          handleFilter={handleFilter}
          labels={locationLabels}
        />
      </div>
      <div className="content-group">
        <RadioButtonsGroup
          label='Tournament Filter'
          value={tournamentFilter}
          setValue={setTournamentFilter}
          options={tournamentOptions}
        />
      </div>
    </div>
  )
}