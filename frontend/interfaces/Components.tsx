import { Dispatch, ReactNode, SetStateAction } from 'react';
import { UniqueFilter } from './Filters';

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface DailyTabs {
  allBaseFilters: number[];
  showOnly: Array<number[]>;
  dateList: UniqueFilter;
  hideMaterialReq: boolean;
  hideSoldOut: boolean;
  materialsRequired: number[];
  soldOutEvents: number[];
  tournamentFilter: string;
  tourneyList: number[];
  earlyStartTime: string;
  lateStartTime: string;
  startTimes: UniqueFilter;
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