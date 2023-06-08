import Events from '@/data/events.json';

interface rawEvent {
  'Game ID': string,
  Group?: string,
  Title: string,
  'Short Description'?: string,
  'Long Description'?: string,
  'Event Type': string,
  'Game System'?: string,
  'Rules Edition'?: string,
  'Minimum Players'?: string,
  'Maximum Players'?: string,
  'Age Required': string,
  'Experience Required': string,
  'Materials Required': string,
  'Materials Required Details'?: string,
  'Start Date & Time': string,
  Duration?: string,
  'End Date & Time': string,
  'GM Names'?: string,
  Website?: string,
  Email?: string,
  'Tournament?': 'No',
  'Round Number'?: string,
  'Total Rounds'?: string,
  'Minimum Play Time'?: string,
  'Attendee Registration?'?: string,
  'Cost $': string,
  Location?: string,
  'Room Name'?: string,
  'Table Number'?: '',
  'Special Category'?: string,
  'Tickets Available'?: string,
  'Last Modified': string
}

interface newEvent {
  id: number,
  gameId: string,
  group?: string,
  title: string,
  eventType: string,
  gameSystem?: string,
  ageRequirement: string,
  experienceRequirement: string,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  tournament: boolean,
  cost: number,
  location?: string,
  ticketsAvailable?: number
}

interface UniqueFilter {
  [index: string]: Array<number>
}

interface TournamentFilter {
  true: Array<number>,
  false: Array<number>
}

interface FilterTypes {
  groups: UniqueFilter,
  eventTypes: UniqueFilter,
  gameSystems: UniqueFilter,
  ageRequirements: UniqueFilter,
  experienceRequirements: UniqueFilter,
  startDate: UniqueFilter,
  startTime: UniqueFilter,
  endDate: UniqueFilter,
  endTime: UniqueFilter,
  ifTournament: TournamentFilter,
  costs: UniqueFilter,
  locations: UniqueFilter,
  ticketsAvailable: UniqueFilter
}

interface Data {
  eventData: Array<newEvent>,
  filters: FilterTypes
}

const getTime = (time: Date) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;
  return `${sHours}:${sMinutes}`
}

const isTournament = (eventTournament: string) => {
  if (eventTournament === "Yes") {
    return true;
  }

  return false;
}

const cleanData = (events: Array<rawEvent>) => {
  const data: Data = {
    eventData: [],
    filters: {
      groups: {},
      eventTypes: {},
      gameSystems: {},
      ageRequirements: {},
      experienceRequirements: {},
      startDate: {},
      startTime: {},
      endDate: {},
      endTime: {},
      ifTournament: {
        true: [],
        false: []
      },
      costs: {},
      locations: {},
      ticketsAvailable: {}
    }
  }

  events.map((event, index) => {
    const newEvent: newEvent = {
      id: 0,
      gameId: '',
      group: '',
      title: '',
      eventType: '',
      gameSystem: '',
      ageRequirement: '',
      experienceRequirement: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      tournament: false,
      cost: 0,
      location: '',
      ticketsAvailable: 0
    };
    const rawStart = new Date(event["Start Date & Time"]);
    const rawEnd = new Date(event["End Date & Time"]);

    const groupName = event["Group"];
    const eventType = event["Event Type"];
    const gameSystem = event["Game System"];
    const ageReq = event["Age Required"];
    const exp = event["Experience Required"];

    newEvent.id = index;
    newEvent.gameId = event["Game ID"];

    // Group Name
    if (groupName) {
      if (!data.filters.groups[groupName]) {
        data.filters.groups[groupName] = []
      }
      data.filters.groups[groupName].push(index);
    }
    newEvent.group = groupName;

    newEvent.title = event["Title"];

    // Event Name
    if (eventType) {
      if (!data.filters.eventTypes[eventType]) {
        data.filters.eventTypes[eventType] = []
      }
      data.filters.eventTypes[eventType].push(index);
    }
    newEvent.eventType = eventType;

    // System Name
    if (gameSystem) {
      if (!data.filters.gameSystems[gameSystem]) {
        data.filters.gameSystems[gameSystem] = []
      }
      data.filters.gameSystems[gameSystem].push(index);
    }
    newEvent.gameSystem = gameSystem;

    // Age Requirement
    if (ageReq) {
      if (!data.filters.ageRequirements[ageReq]) {
        data.filters.ageRequirements[ageReq] = []
      }
      data.filters.ageRequirements[ageReq].push(index);
    }
    newEvent.ageRequirement = ageReq;

    // Experience Requirement
    if (exp) {
      if (!data.filters.experienceRequirements[exp]) {
        data.filters.experienceRequirements[exp] = []
      }
      data.filters.experienceRequirements[exp].push(index);
    }
    newEvent.experienceRequirement = exp;

    newEvent.startDate = rawStart.toLocaleDateString();
    newEvent.startTime = getTime(rawStart);
    newEvent.endDate = rawEnd.toLocaleDateString();
    newEvent.endTime = getTime(rawEnd);
    newEvent.tournament = isTournament(event["Tournament?"]);
    newEvent.cost = Number(event["Cost $"]);
    newEvent.location = event["Location"];
    newEvent.ticketsAvailable = Number(event["Tickets Available"]);

    data.eventData.push(newEvent);
  })

  return data;
};

export default function getData() {
  const rawData = Events as Array<rawEvent>;

  const data = cleanData(rawData);

  return data;
}