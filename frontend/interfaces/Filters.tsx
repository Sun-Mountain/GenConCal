import { Dispatch, SetStateAction } from 'react';

export interface UniqueFilter {
  [index: string]: Array<number>;
}

export interface FilterTypes {
  ageRequirements: UniqueFilter;
  costs: UniqueFilter;
  durationLength: UniqueFilter;
  endDates: UniqueFilter;
  endTimes: UniqueFilter;
  eventTypes: UniqueFilter;
  experienceRequirements: UniqueFilter;
  gameSystems: UniqueFilter;
  groups: UniqueFilter;
  locations: UniqueFilter;
  materialsRequired: Array<number>;
  noTickets: Array<number>;
  startDates: UniqueFilter;
  startTimes: UniqueFilter;
  tournament: Array<number>;
}

export interface SlideFilter {
  label: string;
  filterValues: number[];
  setFilter: Dispatch<SetStateAction<number[]>>;
  step: number;
  min: number;
  max: number;
}