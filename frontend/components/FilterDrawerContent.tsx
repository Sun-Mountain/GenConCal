import { filterTypes } from "@/pages/_app"
import AutoCompleteComponent from "./UI/AutoComplete"

const eventTypesList = filterTypes.eventTypes;

export default function FilterDrawerContent () {
  return (
    <>
      <AutoCompleteComponent
        filter={eventTypesList}
        label='Event Type'
      />
    </>
  )
}