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