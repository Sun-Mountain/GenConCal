import { Dispatch, MouseEvent, ReactNode, SetStateAction } from "react";
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
  dateList: UniqueFilter;
  handleChoice: Function;
  hideSoldOut: boolean;
  soldOutEvents: number[];
  earlyStartTime: string;
  lateStartTime: string;
  startTimes: UniqueFilter;
}

export interface EventListing {
  eventIndex: number;
  handleChoice: Function;
  type: string;
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