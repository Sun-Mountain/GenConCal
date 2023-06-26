import { ValueOf } from "next/dist/shared/lib/constants";
import { Dispatch, SetStateAction } from "react";

export enum AgeRequirementEnum {
  'kids only (12 and under)',
  'Everyone (6+)',
  'Teen (13+)',
  'Mature (18+)',
  '21+'
}

export interface FilteredEvents {
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

export interface FilterProps {
  [index: string]: boolean;
}