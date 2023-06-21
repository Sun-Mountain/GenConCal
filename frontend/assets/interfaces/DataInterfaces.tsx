import { NewEvent } from "./EventInterfaces";
import { FilterTypes } from "./FilterInterfaces";

export interface DataInterface {
  eventData: NewEvent[];
  filterTypes: FilterTypes;
}