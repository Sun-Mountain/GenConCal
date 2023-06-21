import { DataInterface } from "@/assets/interfaces/DataInterfaces";
import { NewEvent, RawEvent } from "@/assets/interfaces/EventInterfaces";
import getTime from "./getTime";

export default function cleanData (eventData: RawEvent[]) {
  var data: DataInterface = {
        eventData: [],
        filterTypes: {
          ageRequirement: {},
          cost: {},
          duration: {},
          endDates: {},
          endTimes: {},
          startDates: {},
          startTimes: {}
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
      playTimeMin: 0,
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
        eventEndTime = getTime(rawEnd)

    newEvent.id = index

    // Age Requirement
    newEvent.ageRequirement = ageReq
    if (!data.filterTypes.ageRequirement[ageReq]) {
      data.filterTypes.ageRequirement[ageReq] = []
    }
    data.filterTypes.ageRequirement[ageReq].push(index)

    // Contact
    if (contact) {
      newEvent.contact = contact
    }

    // Cost
    if (!data.filterTypes.cost[cost]) {
      data.filterTypes.cost[cost] = []
    }
    data.filterTypes.cost[cost].push(index)
    newEvent.cost = cost

    // Duration
    if (duration) {
      if (!data.filterTypes.duration[duration]) {
        data.filterTypes.duration[duration] = []
      }
      data.filterTypes.duration[duration].push(index)
    }
    newEvent.duration = duration

    // Descriptions
    newEvent.descriptionShort = descriptionShort
    newEvent.descriptionLong = descriptionLong

    // Event Start and End Dates and Times
    if (!data.filterTypes.endDates[eventEndDate]) {
      data.filterTypes.endDates[eventEndDate] = []
    }
    data.filterTypes.endDates[eventEndDate].push(index)
    newEvent.endDate = eventEndDate

    if (!data.filterTypes.endTimes[eventEndTime]) {
      data.filterTypes.endTimes[eventEndTime] = []
    }
    data.filterTypes.endTimes[eventEndTime].push(index)
    newEvent.endTime = eventEndTime

    if (!data.filterTypes.startDates[eventStartDate]) {
      data.filterTypes.startDates[eventStartDate] = []
    }
    data.filterTypes.startDates[eventStartDate].push(index)
    newEvent.startDate = eventStartDate

    if (!data.filterTypes.startTimes[eventStartTime]) {
      data.filterTypes.startTimes[eventStartTime] = []
    }
    data.filterTypes.startTimes[eventStartTime].push(index)
    newEvent.startTime = eventStartTime

    data.eventData.push(newEvent)
  })

  return data
}