import { DataProps, NewEvent, RawEvent } from "@/assets/interfaces";
import getTime from "./getTime";
import trueOrFalse from "./trueOrFalse";

export default function cleanData (eventData: RawEvent[]) {
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

  eventData.map((event, index) => {
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

    var rawStart = new Date(event["Start Date & Time"]),
        rawEnd = new Date(event["End Date & Time"]),
        ageReq = event['Age Required'],
        contact = event.Email,
        cost = Number(event['Cost $']),
        duration = Number(event.Duration),
        descriptionShort = event['Short Description'],
        descriptionLong = event['Long Description'],
        eventStartDate = rawStart.toLocaleDateString(),
        eventStartTime = getTime(rawStart),
        eventEndDate = rawEnd.toLocaleDateString(),
        eventEndTime = getTime(rawEnd),
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

    newEvent.id = index

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
    if (!data.filteredEvents.cost[cost]) {
      data.filteredEvents.cost[cost] = []
    }
    data.filteredEvents.cost[cost].push(index)
    newEvent.cost = cost

    // Duration
    if (duration) {
      if (!data.filteredEvents.duration[duration]) {
        data.filteredEvents.duration[duration] = []
      }
      data.filteredEvents.duration[duration].push(index)
    }
    newEvent.duration = duration

    // Descriptions
    newEvent.descriptionShort = descriptionShort
    newEvent.descriptionLong = descriptionLong

    // Event Start and End Dates and Times
    if (!data.filteredEvents.endDates[eventEndDate]) {
      data.filteredEvents.endDates[eventEndDate] = []
    }
    data.filteredEvents.endDates[eventEndDate].push(index)
    newEvent.endDate = eventEndDate

    if (!data.filteredEvents.endTimes[eventEndTime]) {
      data.filteredEvents.endTimes[eventEndTime] = []
    }
    data.filteredEvents.endTimes[eventEndTime].push(index)
    newEvent.endTime = eventEndTime

    if (!data.filteredEvents.startDates[eventStartDate]) {
      data.filteredEvents.startDates[eventStartDate] = []
    }
    data.filteredEvents.startDates[eventStartDate].push(index)
    newEvent.startDate = eventStartDate

    if (!data.filteredEvents.startTimes[eventStartTime]) {
      data.filteredEvents.startTimes[eventStartTime] = []
    }
    data.filteredEvents.startTimes[eventStartTime].push(index)
    newEvent.startTime = eventStartTime

    // Event Type
    if (!data.filteredEvents.eventTypes[eventType]) {
      data.filteredEvents.eventTypes[eventType] = []
    }
    data.filteredEvents.eventTypes[eventType].push(index)
    newEvent.eventType = eventType

    // Experience Type
    if (!data.filteredEvents.experienceType[experienceReq]) {
      data.filteredEvents.experienceType[experienceReq] = [];
    }
    data.filteredEvents.experienceType[experienceReq].push(index)
    newEvent.experienceType = experienceReq

    // Game Id
    newEvent.gameId = gameId

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
    }
    newEvent.ticketsAvailable = ticketsAvailable

    // Title
    newEvent.title = title

    // Tournament 
    if (tournament) {
      data.filteredEvents.tournaments.push(index)
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

  return data
}