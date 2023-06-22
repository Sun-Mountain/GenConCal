import { Dispatch, SetStateAction } from "react";

export enum AgeRequirementEnum {
  'Kids Only (12 and under)' = 'kids only (12 and under)',
  'Everyone (6+)' = 'Everyone (6+)',
  'Teen (13+)' = 'Teen (13+)',
  'Mature (18+)' = 'Mature (18+)',
  '21+' = '21+'
}

export interface FilterContainerInterface {
  ageFilter: number[];
  setAgeFilter: Dispatch<SetStateAction<number[]>>;
  filterByAge: UniqueFilter;
}

export interface FilterTypes {
  ageRequirement: UniqueFilter;
  cost: UniqueFilter;
  duration: UniqueFilter;
  endDates: UniqueFilter;
  endTimes: UniqueFilter;
  eventTypes: UniqueFilter;
  experienceType: UniqueFilter;
  gameSystems: UniqueFilter;
  groups: UniqueFilter;
  locations: UniqueFilter;
  materialsRequired: number[];
  noTickets: number[];
  startDates: UniqueFilter;
  startTimes: UniqueFilter;
  tournaments: number[];
}

export interface UniqueFilter {
  [index: string]: number[];
}

export interface UniqueStrings {
  [index: string]: string;
}