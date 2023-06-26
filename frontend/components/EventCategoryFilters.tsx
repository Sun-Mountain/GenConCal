import { FilterDrawerProps } from "@/assets/interfaces";
import { filteredEvents } from "@/pages/_app";
import ButtonGroup from "@/components/UI/ButtonGroup";
import AutocompleteComponent from "@/components/UI/AutoComplete";
import RadioButtonsGroup from "@/components/UI/RadioGroup";

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

export default function EventCategoryFilters ({
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
        <AutocompleteComponent
          groupLabel='Event Types'
          hiddenList={eventTypeList}
          handleFilter={handleFilter}
          labels={eventTypeLabels}
        />
        <AutocompleteComponent
          groupLabel='Game Systems'
          hiddenList={gameSystemList}
          handleFilter={handleFilter}
          labels={gameSystemLabels}
        />
        <AutocompleteComponent
          groupLabel='Company / Group'
          hiddenList={groupsList}
          handleFilter={handleFilter}
          labels={groupLabels}
        />
        <AutocompleteComponent
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