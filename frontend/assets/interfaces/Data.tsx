import { NewEvent } from "./Event";
import { FilteredEvents } from "./Filter";

export interface DataProps {
  eventData: NewEvent[];
  filteredEvents: FilteredEvents;
}

export interface CountObj {
  [index: string]: number
}

export interface KeyProps {
  A: 'Game ID',
  B: 'Group',
  C: 'Title',
  D: 'Short Description',
  E: 'Long Description',
  F: 'Event Type',
  G: 'Game System',
  H: 'Rules Edition',
  I: 'Minimum Players',
  J: 'Maximum Players',
  K: 'Age Required',
  L: 'Experience Required',
  M: 'Materials Required',
  N: 'Materials Required Details',
  O: 'Start Date & Time',
  P: 'Duration',
  Q: 'End Date & Time',
  R: 'GM Names',
  S: 'Website',
  T: 'Email',
  U: 'Tournament?',
  V: 'Round Number',
  W: 'Total Rounds',
  X: 'Minimum Play Time',
  Y: 'Attendee Registration?',
  Z: 'Cost $',
  AA: 'Location',
  AB: 'Room Name',
  AC: 'Table Number',
  AD: 'Special Category',
  AE: 'Tickets Available',
  AF: 'Last Modified'
}

export interface EventListingProps {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
  H: string;
  I: number;
  J: number;
  K: string;
  L: string;
  M: string;
  N: string;
  O: string;
  P: number;
  Q: string;
  R: string;
  S: string;
  T: string;
  U: string;
  V: number;
  W: number;
  X: string;
  Y: string;
  Z: number;
  AA: string;
  AB: number;
  AC: string;
  AD: string;
  AE: number;
  AF: string;
}
