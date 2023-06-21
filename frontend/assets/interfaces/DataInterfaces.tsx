import { NewEvent } from "./EventInterfaces";
import { UniqueFilter } from "./FilterInterfaces";

export interface DataInterface {
  eventData: NewEvent[];
  filterTypes: {
    ageRequirement: UniqueFilter;
  }
}