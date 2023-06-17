import { NewEvent } from "./Events"
import { FilterTypes } from "./Filters"

export interface Data {
  eventData: Array<NewEvent>,
  filters: FilterTypes
}