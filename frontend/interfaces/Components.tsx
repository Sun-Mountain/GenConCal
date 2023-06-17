import { Dispatch, ReactNode, SetStateAction } from "react";
import { UniqueFilter } from "./Filters";

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface DailyTabs {
  allBaseFilters: number[];
  showOnly: Array<number[]>;
  choices: number[];
  setChoices: Dispatch<SetStateAction<number[]>>,
  dateList: UniqueFilter;
  hideSoldOut: boolean;
  soldOutEvents: number[];
  earlyStartTime: string;
  lateStartTime: string;
  startTimes: UniqueFilter;
}

export interface SwitchInterface {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export interface TimeComponent {
  events: number[];
  time: string;
}

export interface TimeRangeComponent {
  earlyStartTime: string;
  lateStartTime: string;
  setEarlyStartTime: Dispatch<SetStateAction<string>>;
  setLateStartTime: Dispatch<SetStateAction<string>>;
}