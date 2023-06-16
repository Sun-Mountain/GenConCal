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

export interface NewEvent {
  id: number,
  gameId: string,
  group?: string,
  title: string,
  shortDescription?: string,
  longDescription?: string,
  eventType: string,
  gameSystem?: string,
  ageRequirement: string,
  experienceRequirement: string,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  duration: number,
  tournament: boolean,
  cost: number,
  location?: string,
  ticketsAvailable?: number,
  maxTickets?: number
}

export interface UniqueFilter {
  [index: string]: Array<number>
}

interface TournamentFilter {
  true: Array<number>,
  false: Array<number>
}

export interface FilterTypes {
  groups: UniqueFilter,
  eventTypes: UniqueFilter,
  gameSystems: UniqueFilter,
  ageRequirements: UniqueFilter,
  experienceRequirements: UniqueFilter,
  startDates: UniqueFilter,
  startTimes: UniqueFilter,
  endDates: UniqueFilter,
  endTimes: UniqueFilter,
  tournament: Array<number>,
  costs: UniqueFilter,
  locations: UniqueFilter,
  noTickets: Array<number>
}

interface Data {
  eventData: Array<NewEvent>,
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

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
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
      startDates: {},
      startTimes: {},
      endDates: {},
      endTimes: {},
      tournament: [],
      costs: {},
      locations: {},
      noTickets: []
    }
  }

  events.map((event, index) => {
    const newEvent: NewEvent = {
      id: 0,
      gameId: '',
      group: '',
      title: '',
      shortDescription: '',
      longDescription: '',
      eventType: '',
      gameSystem: '',
      ageRequirement: '',
      experienceRequirement: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      duration: 0,
      tournament: false,
      cost: 0,
      location: '',
      ticketsAvailable: 0,
      maxTickets: 0
    };

    const rawStart = new Date(event["Start Date & Time"]);
    const rawEnd = new Date(event["End Date & Time"]);

    const shortDescription = event["Short Description"];
    const longDescription = event["Long Description"];
    const groupName = event["Group"];
    const eventType = event["Event Type"];
    const gameSystem = event["Game System"];
    const ageReq = event["Age Required"];
    const exp = event["Experience Required"];
    const eventStartDate = rawStart.toLocaleDateString();
    const eventStartTime = getTime(rawStart);
    const eventEndDate = rawEnd.toLocaleDateString();
    const eventEndTime = getTime(rawEnd);
    const isTourny = isTournament(event["Tournament?"]);
    const eventCost = Number(event["Cost $"]);
    const eventLocation = event["Location"]?.toUpperCase();
    const eventTickets = Number(event["Tickets Available"]);

    newEvent.id = index;
    newEvent.gameId = event["Game ID"];
    newEvent.duration = Number(event["Duration"]);
    newEvent.maxTickets = Number(event['Maximum Players']);

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

    // Event Description
    newEvent.shortDescription = shortDescription;
    newEvent.longDescription = longDescription;

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

    // Start Date
    if (eventStartDate) {
      if (!data.filters.startDates[eventStartDate]) {
        data.filters.startDates[eventStartDate] = []
      }
      data.filters.startDates[eventStartDate].push(index);
    }
    newEvent.startDate = eventStartDate;

    // Start Time
    if (eventStartTime) {
      if (!data.filters.startTimes[eventStartTime]) {
        data.filters.startTimes[eventStartTime] = []
      }
      data.filters.startTimes[eventStartTime].push(index);
    }
    newEvent.startTime = eventStartTime;

    // End Date
    if (eventEndDate) {
      if (!data.filters.endDates[eventEndDate]) {
        data.filters.endDates[eventEndDate] = []
      }
      data.filters.endDates[eventEndDate].push(index);
    }
    newEvent.endDate = eventEndDate;

    // End Time
    if (eventEndTime) {
      if (!data.filters.endTimes[eventEndTime]) {
        data.filters.endTimes[eventEndTime] = []
      }
      data.filters.endTimes[eventEndTime].push(index);
    }
    newEvent.endTime = eventEndTime;

    // Tournament
    if (isTourny) {
      data.filters.tournament.push(index);
    };
    newEvent.tournament = isTourny;

    // Costs
    if (!data.filters.costs[eventCost]) {
      data.filters.costs[eventCost] = []
    }
    data.filters.costs[eventCost].push(index);
    newEvent.cost = eventCost;

    // Locations
    if (eventLocation) {
      if (!data.filters.locations[eventLocation]) {
        data.filters.locations[eventLocation] = []
      }
      data.filters.locations[eventLocation].push(index);
    }
    newEvent.location = eventLocation;

    // Tickets
    if (!eventTickets) {
      data.filters.noTickets.push(index);
    }
    newEvent.ticketsAvailable = eventTickets;

    data.eventData.push(newEvent);
  })

  return data;
};

export default function getData() {
  const rawData = Events as Array<rawEvent>;

  const data = cleanData(rawData);

  return data;
}