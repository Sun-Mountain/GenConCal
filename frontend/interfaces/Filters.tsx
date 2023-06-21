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