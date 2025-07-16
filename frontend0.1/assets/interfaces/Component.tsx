import { Dispatch, ReactNode, SetStateAction } from "react";

interface RadioChoiceProps {
  value: string;
  choiceLabel: string;
}

// Basic Components

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

export interface DataTableProps {
  events: number[];
  handleFaves: Function;
  includesFave: Function;
}

export interface DoubleSlideFilterProps {
  label: string;
  filterValues: number[];
  setFilter: Dispatch<SetStateAction<number[]>>;
  step: number;
  min: number;
  max: number;
  unit: string;
}

export interface EventListingProps {
  eventIndex: number;
  handleFaves: Function;
  includesFave: Function;
}

export interface LikeButtonProps {
  handleFaves: Function;
  includesFave: Function;
}

export interface RadioGroupProps {
  value: string | null;
  label: string;
  options: RadioChoiceProps[];
  setValue: Dispatch<SetStateAction<'' | 'hide' | 'show'>>;
}

export interface TimeFilterProps {
  earliestStartTime: string;
  setEarliestStartTime: Dispatch<SetStateAction<string>>;
  latestStartTime: string;
  setLatestStartTime: Dispatch<SetStateAction<string>>;
  durationFilter: number[];
  setDurationFilter: Dispatch<SetStateAction<number[]>>;
}

export interface ToggleType {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export interface DailyTabsTypes {
  durationFilter: number[];
  earliestStartTime: string;
  latestStartTime: string;
  filterFor: number[];
  filterOut: number[];
  handleFaves: Function;
  includesFave: Function;
  hideSoldOut: boolean;
  tournamentFilter: '' | 'hide' | 'show';
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

export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

export interface DrawerFiltersProps {
  handleFilter: Function;
  ageReqList: string[];
  xpReqList: string[];
  eventTypeList: string[];
  locationList: string[];
  gameSystemList: string[];
  groupsList: string[];
  tournamentFilter: string | null;
  setTournamentFilter: Dispatch<SetStateAction<'' | 'hide' | 'show'>>;
  earliestStartTime: string;
  setEarliestStartTime: Dispatch<SetStateAction<string>>;
  latestStartTime: string;
  setLatestStartTime: Dispatch<SetStateAction<string>>;
  durationFilter: number[];
  setDurationFilter: Dispatch<SetStateAction<number[]>>;
}

export interface FavoritesProps {
  faves: number[];
  handleFaves: Function;
  setFaves: Dispatch<SetStateAction<number[]>>;
}

export interface ClearFavesProps {
  setFaves: Dispatch<SetStateAction<number[]>>;
}