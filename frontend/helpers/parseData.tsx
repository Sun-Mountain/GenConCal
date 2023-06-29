import Events from '@/assets/events/events2Parse.json';
import returnFirstKey from './returnFirstKey';
import { DataProps, NewEvent, UnparsedProps } from '@/assets/interfaces';
import getTime from './getTime';
import trueOrFalse from './trueOrFalse';

function cleanParsedData (
  masterList: UnparsedProps,
  rawEventList: any
) {
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

  rawEventList.map((event: any, index: number) => {
    var newEvent: NewEvent = {
      id: 0,
      ageRequirement: '',
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

    // Keys
    var startDateTimeKey = Object.keys(masterList).find(key => masterList[key] === "Start Date & Time"),
        endDateTimeKey = Object.keys(masterList).find(key => masterList[key] === "End Date & Time"),
        ageRequiredKey = Object.keys(masterList).find(key => masterList[key] === "Age Required"),
        emailKey = Object.keys(masterList).find(key => masterList[key] === "Email"),
        costKey = Object.keys(masterList).find(key => masterList[key] === "Cost $"),
        durationKey = Object.keys(masterList).find(key => masterList[key] === "Duration"),
        shortDescriptionKey = Object.keys(masterList).find(key => masterList[key] === "Short Description"),
        longDescriptionKey = Object.keys(masterList).find(key => masterList[key] === "Long Description");

    var rawStart = startDateTimeKey && new Date(event[startDateTimeKey]),
        rawEnd = endDateTimeKey && new Date(event[endDateTimeKey]),
        ageReq = ageRequiredKey && event[ageRequiredKey],
        contact = emailKey && event[emailKey],
        cost = costKey && Number(event[costKey]),
        duration = Number(durationKey),
        descriptionShort = shortDescriptionKey && event[shortDescriptionKey],
        descriptionLong = longDescriptionKey && event[longDescriptionKey],
        eventStartDate = rawStart && rawStart.toLocaleDateString(),
        eventStartTime = rawStart && getTime(rawStart),
        eventEndDate = rawEnd && rawEnd.toLocaleDateString(),
        eventEndTime = rawEnd &&getTime(rawEnd),
        eventType = event['Event Type'],
        experienceReq = event['Experience Required'],
        gameId = event['Game ID'],
        gameSystem = event['Game System'],
        gmNames = event['GM Names'],
        group = event['Group'],
        location = event['Location']?.toUpperCase(),
        materials = event['Materials Required Details'],
        playersMin = Number(event['Minimum Players']),
        playersMax = Number(event['Maximum Players']),
        tableNum = Number(event['Table Number']),
        ticketsAvailable = Number(event['Tickets Available']),
        title = event['Title'],
        tournament = trueOrFalse(event['Tournament?']),
        room = event['Room Name'],
        round = Number(event['Round Number']),
        roundTotal = Number(event['Total Rounds']),
        website = event['Website'];

    newEvent.id = index;

    // Age Requirement
    newEvent.ageRequirement = ageReq
    if (!data.filteredEvents.ageRequirement[ageReq]) {
      data.filteredEvents.ageRequirement[ageReq] = [];
    }
    data.filteredEvents.ageRequirement[ageReq].push(index)

    // Contact
    if (contact) {
      newEvent.contact = contact
    }

    // Cost
    if (cost || cost === 0) {
      if (!data.filteredEvents.cost[cost]) {
        data.filteredEvents.cost[cost] = []
      }
      data.filteredEvents.cost[cost].push(index)
      newEvent.cost = cost
    }

    // Duration
    if (duration) {
      if (!data.filteredEvents.duration[duration]) {
        data.filteredEvents.duration[duration] = []
      }
      data.filteredEvents.duration[duration].push(index)
      newEvent.duration = duration
    }

    newEvent.descriptionShort = descriptionShort
    newEvent.descriptionLong = descriptionLong

    // Event Start and End Dates and Times
    if (eventEndDate) {
      if (!data.filteredEvents.endDates[eventEndDate]) {
        data.filteredEvents.endDates[eventEndDate] = []
      }
      data.filteredEvents.endDates[eventEndDate].push(index)
      newEvent.endDate = eventEndDate
    }

    if (eventEndTime) {
      if (!data.filteredEvents.endTimes[eventEndTime]) {
        data.filteredEvents.endTimes[eventEndTime] = []
      }
      data.filteredEvents.endTimes[eventEndTime].push(index)
      newEvent.endTime = eventEndTime
    }

    if (eventStartDate) {
      if (!data.filteredEvents.startDates[eventStartDate]) {
        data.filteredEvents.startDates[eventStartDate] = []
      }
      data.filteredEvents.startDates[eventStartDate].push(index)
      newEvent.startDate = eventStartDate
    }

    if (eventStartTime) {
      if (!data.filteredEvents.startTimes[eventStartTime]) {
        data.filteredEvents.startTimes[eventStartTime] = []
      }
      data.filteredEvents.startTimes[eventStartTime].push(index)
      newEvent.startTime = eventStartTime
    }

    data.eventData.push(newEvent)
  })

  return data;
}

export default function parseData() {
  const rawJSON = Events as any;
  const firstKey = returnFirstKey(rawJSON);
  const rawEventList = rawJSON[firstKey];

  // create enum
  const masterList = rawEventList[0];
  Object.freeze(masterList);

  delete rawEventList[0];

  // clean data

  const parsedData = cleanParsedData(masterList, rawEventList);

  console.log(parsedData);
  return parsedData;
}