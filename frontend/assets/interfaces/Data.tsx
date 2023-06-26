import { NewEvent } from "./Event";
import { FilteredEvents } from "./Filter";

export interface filterSubProps {
  [index: string]: boolean;
}

export interface filterCatProps {
  [index: string]: filterSubProps;
}

export interface DataProps {
  eventData: NewEvent[];
  filterCategories: filterCatProps;
  filteredEvents: FilteredEvents;
}

export interface CountObj {
  [index: string]: number
}
