enum AgeRequirementValues {
  'kids only (12 and under)' = 'Kids Only (12 and under)',
  'Everyone (6+)' = 'Everyone (6+)',
  'Teen (13+)' = 'Teen (13+)',
  'Mature (18+)' = 'Mature (18+)',
  '21+' = '21+'
}

export type AgeRequirementKeys = keyof typeof AgeRequirementValues;

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