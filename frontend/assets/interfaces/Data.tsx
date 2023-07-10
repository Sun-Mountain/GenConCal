import { NewEvent } from "./Event";
import { FilteredEvents } from "./Filter";

export interface DataProps {
  eventData: NewEvent[];
  filteredEvents: FilteredEvents;
}

export interface CountObj {
  [index: string]: number;
}
