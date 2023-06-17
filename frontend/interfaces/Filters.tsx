export interface UniqueFilter {
  [index: string]: Array<number>;
}

export interface FilterTypes {
  groups: UniqueFilter;
  eventTypes: UniqueFilter;
  gameSystems: UniqueFilter;
  ageRequirements: UniqueFilter;
  experienceRequirements: UniqueFilter;
  startDates: UniqueFilter;
  startTimes: UniqueFilter;
  endDates: UniqueFilter;
  endTimes: UniqueFilter;
  tournament: Array<number>;
  costs: UniqueFilter;
  locations: UniqueFilter;
  noTickets: Array<number>;
}