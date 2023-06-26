import { Dispatch, ReactNode, SetStateAction } from "react";
import { FilterProps, UniqueFilter } from "@/assets/interfaces";

export interface ButtonGroupProps {
  groupLabel: string;
  hiddenList: string[];
  handleFilter: Function;
  labels: string[]
}

export interface DailyTabsTypes {
  filterOut: number[];
  hideSoldOut: boolean;
}

export interface FilterDrawerProps {
  ageReqList: string[];
  handleFilter: Function;
  xpReqList: string[];
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
