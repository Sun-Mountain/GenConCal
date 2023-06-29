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
        longDescriptionKey = Object.keys(masterList).find(key => masterList[key] === "Long Description"),
        eventTypeKey = Object.keys(masterList).find(key => masterList[key] === "Event Type"),
        experienceTypeKey = Object.keys(masterList).find(key => masterList[key] === "Experience Required"),
        gameIdKey = Object.keys(masterList).find(key => masterList[key] === "Game ID"),
        gameSystemKey = Object.keys(masterList).find(key => masterList[key] === "Game System"),
        gmNamesKey = Object.keys(masterList).find(key => masterList[key] === "GM Names"),
        groupKey = Object.keys(masterList).find(key => masterList[key] === "Group"),
        locationKey = Object.keys(masterList).find(key => masterList[key] === "Location"),
        materialsKey = Object.keys(masterList).find(key => masterList[key] === "Materials Required Details"),
        playersMinKey = Object.keys(masterList).find(key => masterList[key] === "Minimum Players"),
        playersMaxKey = Object.keys(masterList).find(key => masterList[key] === "Maximum Players"),
        tableNumKey = Object.keys(masterList).find(key => masterList[key] === "Table Number"),
        ticketsKey = Object.keys(masterList).find(key => masterList[key] === "Tickets Available"),
        titleKey = Object.keys(masterList).find(key => masterList[key] === "Title"),
        tournamentKey = Object.keys(masterList).find(key => masterList[key] === "Tournament?"),
        roomKey = Object.keys(masterList).find(key => masterList[key] === "Room Name"),
        roundKey = Object.keys(masterList).find(key => masterList[key] === "Round Number"),
        roundTotalKey = Object.keys(masterList).find(key => masterList[key] === "Total Rounds"),
        websiteKey = Object.keys(masterList).find(key => masterList[key] === "Website");

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
        eventType = eventTypeKey && event[eventTypeKey],
        experienceReq = experienceTypeKey && event[experienceTypeKey],
        gameId = gameIdKey && event[gameIdKey],
        gameSystem = gameSystemKey && event[gameSystemKey],
        gmNames = gmNamesKey && event[gmNamesKey],
        group = groupKey && event[groupKey],
        location = locationKey && event[locationKey]?.toUpperCase(),
        materials = materialsKey && event[materialsKey],
        playersMin = playersMinKey && Number(event[playersMinKey]),
        playersMax = playersMaxKey && Number(event[playersMaxKey]),
        tableNum = tableNumKey && Number(event[tableNumKey]),
        ticketsAvailable = ticketsKey && Number(event[ticketsKey]),
        title = titleKey && event[titleKey],
        tournament = tournamentKey && trueOrFalse(event[tournamentKey]),
        room = roomKey && event[roomKey],
        round = roundKey && Number(event[roundKey]),
        roundTotal = roundTotalKey && Number(event[roundTotalKey]),
        website = websiteKey && event[websiteKey];

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

    if (website) {
      newEvent.website = website
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

    // Event Type
    if (eventType) {
      if (!data.filteredEvents.eventTypes[eventType]) {
        data.filteredEvents.eventTypes[eventType] = []
      }
      data.filteredEvents.eventTypes[eventType].push(index)
      newEvent.eventType = eventType
    }

    // Experience Type
    if (experienceReq) {
      if (!data.filteredEvents.experienceType[experienceReq]) {
        data.filteredEvents.experienceType[experienceReq] = [];
      }
      data.filteredEvents.experienceType[experienceReq].push(index)
      newEvent.experienceType = experienceReq
    }

    if (gameId) {
      newEvent.gameId = gameId;
    }

    // Game System
    if (gameSystem) {
      if (!data.filteredEvents.gameSystems[gameSystem]) {
        data.filteredEvents.gameSystems[gameSystem] = []
      }
      data.filteredEvents.gameSystems[gameSystem].push(index)
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
      data.filteredEvents.groups[group].push(index)
      newEvent.group = group
    }

    // Location
    if (location) {
      if (!data.filteredEvents.locations[location]) {
        data.filteredEvents.locations[location] = []
      }
      data.filteredEvents.locations[location].push(index)
      newEvent.location = location
    }

    // Materials Required
    if (materials) {
      data.filteredEvents.materialsRequired.push(index)
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
      data.filteredEvents.noTickets.push(index)
    } else {
      newEvent.ticketsAvailable = ticketsAvailable
    }

    // Title
    newEvent.title = title

    // Tournament 
    if (tournament) {
      data.filteredEvents.tournaments.push(index)
      newEvent.tournament = tournament
    }

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

  console.log(parsedData.eventData);
  return parsedData;
}