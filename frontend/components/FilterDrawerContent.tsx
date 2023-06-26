import { FilterDrawerProps } from "@/assets/interfaces";
import { filteredEvents } from "@/pages/_app";
import ButtonGroup from "@/components/UI/ButtonGroup";
import AutocompleteComponent from "./UI/AutoComplete";

const ageLabels = [ 'kids only (12 and under)',
                    'Everyone (6+)',
                    'Teen (13+)',
                    'Mature (18+)',
                    '21+' ]
const xpLabels = Object.keys(filteredEvents.experienceType)
const eventTypeLabels = Object.keys(filteredEvents.eventTypes).sort()
const gameSystemLabels = Object.keys(filteredEvents.gameSystems).sort()

export default function FilterDrawerContent ({
  handleFilter,
  ageReqList,
  xpReqList,
  eventTypeList,
  gameSystemList
}: FilterDrawerProps) {

  return (
    <div className="filter-content">
      <div className="content-group">
        <ButtonGroup
          groupLabel="Age Requirement"
          hiddenList={ageReqList}
          handleFilter={handleFilter}
          labels={ageLabels}
        />
        <ButtonGroup
          groupLabel="Experience Requirement"
          hiddenList={xpReqList}
          handleFilter={handleFilter}
          labels={xpLabels}
        />
      </div>
      <div className="content-group">
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
      </div>
    </div>
  )
}