import { Dispatch, SetStateAction } from 'react';

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