import { Dispatch, ReactNode, SetStateAction } from "react";
import { FilterProps, UniqueFilter } from "@/assets/interfaces";

export interface ButtonGroupProps {
  eventList: UniqueFilter;
  filteredEvents: number[];
  setFilteredEvents: Dispatch<SetStateAction<number[]>>;
  groupLabel: string;
  hiddenList: string[];
  setHiddenList: Dispatch<SetStateAction<string[]>>;
  labels: string[]
}

export interface DailyTabsTypes {
  filterOut: number[];
  hideSoldOut: boolean;
}

export interface FilterDrawerProps {
  ageReqList: string[];
  setAgeReqList: Dispatch<SetStateAction<string[]>>;
  filterAgeReq: number[];
  setFilterAgeReq: Dispatch<SetStateAction<number[]>>;
  xpReqList: string[];
  setXPReqList: Dispatch<SetStateAction<string[]>>;
  filterXPReq: number[];
  setFilterXPReq: Dispatch<SetStateAction<number[]>>;
}

export interface ToggleType {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}
