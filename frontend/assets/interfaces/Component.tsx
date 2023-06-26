import { Dispatch, ReactNode, SetStateAction } from "react";

interface RadioChoiceProps {
  value: string;
  choiceLabel: string;
}

export interface AutocompleteProps {
  groupLabel: string;
  hiddenList: string[];
  handleFilter: Function;
  labels: string[];
}

export interface ButtonGroupProps {
  groupLabel: string;
  hiddenList: string[];
  handleFilter: Function;
  labels: string[]
}

export interface RadioGroupProps {
  value: string | null;
  label: string;
  options: RadioChoiceProps[];
  setValue: Dispatch<SetStateAction<'' | 'hide' | 'show'>>;
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
  eventTypeList: string[];
  gameSystemList: string[];
  groupsList: string[];
  locationList: string[];
  tournamentFilter: string | null;
  setTournamentFilter: Dispatch<SetStateAction<'' | 'hide' | 'show'>>;
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
