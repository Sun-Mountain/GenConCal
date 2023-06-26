import { Dispatch, ReactNode, SetStateAction } from "react";
import { FilterProps, UniqueFilter } from "@/assets/interfaces";

export interface ButtonGroupProps {
  filteredEvents: number[];
  setFilteredEvents: Dispatch<SetStateAction<number[]>>;
  groupLabel: string;
  list: UniqueFilter;
}

export interface DailyTabsTypes {
  hideSoldOut: boolean;
}

export interface FilterDrawerProps {
  filterAgeReq: number[];
  setFilterAgeReq: Dispatch<SetStateAction<number[]>>;
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
