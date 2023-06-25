import { Dispatch, ReactNode, SetStateAction } from "react";

export interface DailyTabsTypes {
  hideSoldOut: boolean;
}

export interface FiltersTypes {
  hideSoldOut: boolean;
  setHideSoldOut: Dispatch<SetStateAction<boolean>>;
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
