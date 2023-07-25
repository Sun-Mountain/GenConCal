const EventData = require('../assets/events/rawEvents.json');

interface UniqueFilter {
  [index: string]: number[];
}

interface FilteredEvents {
  ageRequirement: UniqueFilter;
  cost: UniqueFilter;
  duration: UniqueFilter;
  endDates: UniqueFilter;
  endTimes: UniqueFilter;
  eventTypes: UniqueFilter;
  experienceType: UniqueFilter;
  gameSystems: UniqueFilter;
  groups: UniqueFilter;
  locations: UniqueFilter;
  materialsRequired: number[];
  noTickets: number[];
  startDates: UniqueFilter;
  startTimes: UniqueFilter;
  tournaments: number[];
}

interface NewEvent {
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

interface DataProps {
  eventData: NewEvent[];
  filteredEvents: FilteredEvents;
}

interface EventDataProps {
  [index: string]: string | number;
}

interface KeyProps {
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

const getFirstKey = (object: any) => {
  const keyList = Object.keys(object)

  return keyList[0]
}

const getKeyByValue = (object: any, value: string) => {
  const foundKey = Object.keys(object).find((key) => object[key] === value);
  return foundKey;
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

const trueOrFalse = (value: 'Yes' | 'No') => {
  if (value === 'Yes') {
    return true
  }

  return false
}

const cleanData = ({ keyList, eventList }: {
  keyList: KeyProps;
  eventList: EventDataProps[];
}) => {
  var data: DataProps = {
    eventData: [],
    filteredEvents: {
      ageRequirement: {},
      cost: {},
      duration: {},
      endDates: {},
      endTimes: {},
      eventTypes: {},
      experienceType: {},
      gameSystems: {},
      groups: {},
      locations: {},
      materialsRequired: [],
      noTickets: [],
      startDates: {},
      startTimes: {},
      tournaments: []
    }
  }

  // Event Times
  const startDateTimeKey = getKeyByValue(keyList, "Start Date & Time");
  const endDateTimeKey = getKeyByValue(keyList, "End Date & Time");

  // Event Info
  const ageRequirementKey = getKeyByValue(keyList, "Age Required");
  const contactKey = getKeyByValue(keyList, "Email");
  const costKey = getKeyByValue(keyList, "Cost $");
  const durationKey = getKeyByValue(keyList, "Duration");
  const descriptionShortKey = getKeyByValue(keyList, "Short Description");
  const descriptionLongKey = getKeyByValue(keyList, "Long Description");
  const eventTypeKey = getKeyByValue(keyList, "Event Type");
  const expKey = getKeyByValue(keyList, "Experience Required");
  const gameIdKey = getKeyByValue(keyList, "Game ID");
  const gameSystemKey = getKeyByValue(keyList, "Game System");
  const gmNamesKey = getKeyByValue(keyList, "GM Names");
  const groupKey = getKeyByValue(keyList, "Group");
  const locationKey = getKeyByValue(keyList, "Location");
  const materialsKey = getKeyByValue(keyList, "Materials Required Details");
  const playersMinKey = getKeyByValue(keyList, "Minimum Players");
  const playersMaxKey = getKeyByValue(keyList, "Maximum Players");
  const tableNumKey = getKeyByValue(keyList, "Table Number");
  const ticketCountKey = getKeyByValue(keyList, "Tickets Available");
  const titleKey = getKeyByValue(keyList, "Title");
  const tournamentKey = getKeyByValue(keyList, "Tournament?");
  const roomKey = getKeyByValue(keyList, "Room Name");
  const roundKey = getKeyByValue(keyList, "Round Number");
  const roundTotalKey = getKeyByValue(keyList, "Total Rounds");
  const websiteKey = getKeyByValue(keyList, "Website");

  eventList.map((event: any, index) => {
    var newEvent: NewEvent = {
      id: 0,
      ageRequirement: '',
      conflicts: [],
      contact: '',
      cost: 0,
      descriptionShort: '',
      descriptionLong: '',
      duration: 0,
      endDate: '',
      endTime: '',
      eventType: '',
      experienceType: '',
      gameId: '',
      gameSystem: '',
      gmNames: '',
      group: '',
      location: '',
      materials: '',
      playersMin: 0,
      playersMax: 0,
      startDate: '',
      startTime: '',
      tableNum: 0,
      ticketsAvailable: 0,
      title: '',
      tournament: false,
      room: '',
      round: 0,
      roundTotal: 0,
      website: ''
    }

    var rawStart = new Date(event[startDateTimeKey!]),
        rawEnd = new Date(event[endDateTimeKey!]),
        eventStartDate = rawStart.toLocaleDateString(),
        eventStartTime = getTime(rawStart),
        eventEndDate = rawEnd.toLocaleDateString(),
        eventEndTime = getTime(rawEnd),
        ageReq = event[ageRequirementKey!],
        contact = event[contactKey!],
        cost = Number(event[costKey!]),
        duration = Number(event[durationKey!]),
        descriptionShort = event[descriptionShortKey!],
        descriptionLong = `${event[descriptionLongKey!]}`,
        eventType = event[eventTypeKey!],
        experienceReq = event[expKey!],
        gameId = event[gameIdKey!],
        gameSystem = event[gameSystemKey!],
        gmNames = event[gmNamesKey!],
        group = event[groupKey!],
        location = event[locationKey!],
        materials = event[materialsKey!],
        playersMin = Number(event[playersMinKey!]),
        playersMax = Number(event[playersMaxKey!]),
        tableNum = Number(event[tableNumKey!]),
        ticketsAvailable = Number(event[ticketCountKey!]),
        title = event[titleKey!],
        tournament = trueOrFalse(event[tournamentKey!]),
        room = event[roomKey!],
        round = Number(event[roundKey!]),
        roundTotal = Number(event[roundTotalKey!]),
        website = event[websiteKey!];
    const newId = index - 1;

    newEvent.id = newId;

    // Event start and end dates and times
    if (!data.filteredEvents.endDates[eventEndDate]) {
      data.filteredEvents.endDates[eventEndDate] = [];
    };
    data.filteredEvents.endDates[eventEndDate].push(newId);
    newEvent.endDate = eventEndDate;

    if (!data.filteredEvents.endTimes[eventEndTime]) {
      data.filteredEvents.endTimes[eventEndTime] = [];
    };
    data.filteredEvents.endTimes[eventEndTime].push(newId);
    newEvent.endTime = eventEndTime;

    if (!data.filteredEvents.startDates[eventStartDate]) {
      data.filteredEvents.startDates[eventStartDate] = [];
    };
    data.filteredEvents.startDates[eventStartDate].push(newId);
    newEvent.startDate = eventStartDate;

    if (!data.filteredEvents.startTimes[eventStartTime]) {
      data.filteredEvents.startTimes[eventStartTime] = [];
    };
    data.filteredEvents.startTimes[eventStartTime].push(newId);
    newEvent.startTime = eventStartTime;

    // Age Requirement
    if (!data.filteredEvents.ageRequirement[ageReq]) {
      data.filteredEvents.ageRequirement[ageReq] = [];
    }
    data.filteredEvents.ageRequirement[ageReq].push(newId)
    newEvent.ageRequirement = ageReq

    // Contact
    if (contact) {
      newEvent.contact = contact
    }

    if (website) {
      newEvent.website = website
    }

    // Cost
    if (!data.filteredEvents.cost[cost]) {
      data.filteredEvents.cost[cost] = []
    }
    data.filteredEvents.cost[cost].push(newId)
    newEvent.cost = cost

    // Duration
    if (duration) {
      if (!data.filteredEvents.duration[duration]) {
        data.filteredEvents.duration[duration] = []
      }
      data.filteredEvents.duration[duration].push(newId)
    }
    newEvent.duration = duration

    // Descriptions
    newEvent.descriptionShort = descriptionShort
    newEvent.descriptionLong = descriptionLong

    // Event Type
    if (!data.filteredEvents.eventTypes[eventType]) {
      data.filteredEvents.eventTypes[eventType] = []
    }
    data.filteredEvents.eventTypes[eventType].push(newId)
    newEvent.eventType = eventType

    // Experience Type
    if (!data.filteredEvents.experienceType[experienceReq]) {
      data.filteredEvents.experienceType[experienceReq] = [];
    }
    data.filteredEvents.experienceType[experienceReq].push(newId)
    newEvent.experienceType = experienceReq

    // Game Id
    newEvent.gameId = gameId


    // Game System
    if (gameSystem) {
      var gameSystemLabel = gameSystem;

      gameSystemLabel = gameSystem.toString().replace(/:/g,'');
      // gameSystemLabel = gameSystemLabel.toUpperCase();

      if (!data.filteredEvents.gameSystems[gameSystemLabel]) {
        data.filteredEvents.gameSystems[gameSystemLabel] = []
      }
      data.filteredEvents.gameSystems[gameSystemLabel].push(newId)
      newEvent.gameSystem = gameSystem
    }

    // GM Names
    if (gmNames) {
      newEvent.gmNames = gmNames
    }

    // Group
    if (group) {
      if (!data.filteredEvents.groups[group]) {
        data.filteredEvents.groups[group] = []
      }
      data.filteredEvents.groups[group].push(newId)
      newEvent.group = group
    }

    // Location
    if (location) {
      if (!data.filteredEvents.locations[location.toUpperCase()]) {
        data.filteredEvents.locations[location.toUpperCase()] = []
      }
      data.filteredEvents.locations[location.toUpperCase()].push(newId)
      newEvent.location = location
    }

    // Materials Required
    if (materials) {
      data.filteredEvents.materialsRequired.push(newId)
      newEvent.materials = materials
    }

    // Player Numbers
    if (playersMin) {
      newEvent.playersMin = playersMin
    }

    if (playersMax) {
      newEvent.playersMax = playersMax
    }

    // Room and Table
    if (tableNum) {
      newEvent.tableNum = tableNum
    }

    if (room) {
      newEvent.room = room
    }

    // Tickets
    if (!ticketsAvailable) {
      data.filteredEvents.noTickets.push(newId)
    }
    newEvent.ticketsAvailable = ticketsAvailable

    // Title
    newEvent.title = title

    // Tournament 
    if (tournament) {
      data.filteredEvents.tournaments.push(newId)
    }
    newEvent.tournament = tournament

    // Rounds
    if (round) {
      newEvent.round = round
    }

    if (roundTotal) {
      newEvent.roundTotal = roundTotal
    }

    data.eventData.push(newEvent)
  })

  return data;
}

const parseData = () => {
  const rawData = EventData as any;

  // Values of first Key
  const firstKey = getFirstKey(rawData)
  const rawJsonValues = rawData[firstKey];

  // Get labels
  const keyRow = getFirstKey(rawJsonValues)
  const labelKey = rawJsonValues[keyRow]
  labelKey.freeze

  // Remove label level
  delete rawJsonValues[keyRow];

  // Events list
  const rawEventsList = rawJsonValues;

  const cleanedData = cleanData({ keyList: labelKey, eventList: rawEventsList });

  return cleanedData;
};

export default console.log(parseData());