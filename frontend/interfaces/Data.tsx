import { FilterTypes } from "@/interfaces/Filters"
import { NewEvent } from "@/interfaces/Events"

export interface Data {
  eventData: Array<NewEvent>,
  filters: FilterTypes
}