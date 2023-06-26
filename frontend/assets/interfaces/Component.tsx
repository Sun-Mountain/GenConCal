import { Dispatch, ReactNode, SetStateAction } from "react";
import { FilterProps, UniqueFilter } from "@/assets/interfaces";

export interface AutocompleteProps {
  componentLabel: string;
  hiddenList: string[] | null;
  handleFilter: Function;
  labels: string[];
}

export interface ButtonGroupProps {
  groupLabel: string;
  hiddenList: string[];
  handleFilter: Function;
  labels: string[]
}

export interface DailyTabsTypes {
  filterFor: number[];
  filterOut: number[];
  hideSoldOut: boolean;
}

export interface FilterDrawerProps {
  handleFilter: Function;
  ageReqList: string[];
  xpReqList: string[];
  eventTypeList: string[] | null;
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
