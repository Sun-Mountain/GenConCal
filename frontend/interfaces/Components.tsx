import { Dispatch, SetStateAction } from 'react';
import { UniqueFilter } from './Filters';

export interface DailyTabs {
  allBaseFilters: number[];
  showOnly: Array<number[]>;
  dateList: UniqueFilter;
  hideSoldOut: boolean;
  hideTourney: boolean;
  tourneyOnly: boolean;
  soldOutEvents: number[];
  tourneyList: number[];
  earlyStartTime: string;
  lateStartTime: string;
  startTimes: UniqueFilter;
}

export interface SwitchInterface {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export interface TournamentSwitches {
  hideTourney: boolean;
  setHideTourney: Dispatch<SetStateAction<boolean>>;
  tourneyOnly: boolean;
  setTourneyOnly: Dispatch<SetStateAction<boolean>>;
}