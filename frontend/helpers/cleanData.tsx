import { DataInterface } from "@/assets/interfaces/DataInterfaces";
import { NewEvent, RawEvent } from "@/assets/interfaces/EventInterfaces";

export default function cleanData (eventData: RawEvent[]) {
  var data: DataInterface = {
        eventData: [],
        filterTypes: {
          ageRequirement: {}
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

    var ageReq = event['Age Required'],
        ageReqFilter = data.filterTypes.ageRequirement[ageReq],
        contact = event.Email;

    newEvent.id = index
    newEvent.ageRequirement = ageReq
    if (!ageReqFilter) {
      ageReqFilter = []
    }
    ageReqFilter.push(index)

    data.eventData.push(newEvent)
  })

  return data
}