import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import { FilterProps } from "@/assets/interfaces";

export interface DailyTabsTypes {
  hideSoldOut: boolean;
}

export interface FilterDrawerProps {
  ageReqFilter: FilterProps;
  setAgeReqFilter: Dispatch<SetStateAction<FilterProps>>;
  expReqFilter: FilterProps;
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
