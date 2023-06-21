export interface NewEvent {
  id: number;
  ageRequirement: string;
  cost: number;
  duration: number;
  endDate: string;
  endTime: string;
  eventType: string;
  experienceType: string;
  gameId: string;
  startDate: string,
  startTime: string,
  title: string;
  contact?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  gameSystem?: string;
  gmNames?: string;
  group?: string;
  location?: string;
  materials?: string,
  playersMin?: number,
  playersMax?: number,
  playTimeMin?: number,
  tableNum?: number,
  ticketsAvailable?: number,
  tournament?: boolean
  room?: string;
  round?: number;
  roundTotal?: number;
  website?: string;
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