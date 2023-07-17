export interface NewEvent {
  id: number;
  ageRequirement: string;
  contact?: string;
  cost: number;
  duration: number;
  endDate: string;
  endTime: string;
  eventType: string;
  experienceType: string;
  descriptionShort?: string;
  descriptionLong?: string;
  gameId: string;
  gameSystem?: string;
  gmNames?: string;
  group?: string;
  location?: string;
  materials?: string,
  playersMin?: number,
  playersMax?: number,
  room?: string;
  round?: number;
  roundTotal?: number;
  startDate: string,
  startTime: string,
  tableNum?: number,
  ticketsAvailable: number,
  title: string;
  tournament?: boolean
  website?: string;
  conflicts?: number[];
}

export interface RawEvent {
  'Game ID': string;
  Group?: string;
  Title: string;
  'Short Description'?: string;
  'Long Description'?: string;
  'Event Type': string;
  'Game System'?: string;
  'Rules Edition'?: string;
  'Minimum Players'?: string;
  'Maximum Players'?: string;
  'Age Required': string;
  'Experience Required': string;
  'Materials Required': string;
  'Materials Required Details'?: string;
  'Start Date & Time': string;
  Duration?: string;
  'End Date & Time': string;
  'GM Names'?: string;
  Website?: string;
  Email?: string;
  'Tournament?': 'No';
  'Round Number'?: string;
  'Total Rounds'?: string;
  'Minimum Play Time'?: string;
  'Attendee Registration?'?: string;
  'Cost $': string;
  Location?: string;
  'Room Name'?: string;
  'Table Number'?: '';
  'Special Category'?: string;
  'Tickets Available'?: string;
  'Last Modified': string;
}

export interface UnparsedProps {
  [index: string]: string;
}