import { Dispatch, ReactNode, SetStateAction } from 'react';
import { UniqueFilter } from './Filters';

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface ChoiceComponent {
  date: string;
  dateChoices: number[];
  handleChoice: Function;
}

export interface DailyTabs {
  allBaseFilters: number[];
  showOnly: Array<number[]>;
  choices: number[];
  dateList: UniqueFilter;
  hideMaterialReq: boolean;
  handleChoice: Function;
  hideSoldOut: boolean;
  materialsRequired: number[];
  soldOutEvents: number[];
  tournamentFilter: string;
  tourneyList: number[];
  earlyStartTime: string;
  lateStartTime: string;
  startTimes: UniqueFilter;
}

export interface EventListing {
  eventIndex: number;
  handleChoice: Function;
  type: string;
}

export interface RadioGroupInterface {
  formLabel: string;
  options: string[];
  setValue: Dispatch<SetStateAction<string>>;
  value?: string;
}

export interface SwitchInterface {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export interface TimeRangeComponent {
  earlyStartTime: string;
  lateStartTime: string;
  setEarlyStartTime: Dispatch<SetStateAction<string>>;
  setLateStartTime: Dispatch<SetStateAction<string>>;
}