import { NewEvent } from "./Event";
import { FilterTypes } from "./Filter";

export interface DataInterface {
  eventData: NewEvent[];
  filterTypes: FilterTypes;
}

export interface CountObj {
  [index: string]: number
}