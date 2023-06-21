import { NewEvent } from "./EventInterfaces";
import { UniqueFilter } from "./FilterInterfaces";

export interface DataInterface {
  eventData: NewEvent[];
  filterTypes: {
    ageRequirement: UniqueFilter;
    cost: UniqueFilter;
    duration: UniqueFilter;
    endDates: UniqueFilter;
    endTimes: UniqueFilter;
    startDates: UniqueFilter;
    startTimes: UniqueFilter;
  }
}