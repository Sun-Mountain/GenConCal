import { NewEvent } from "@/assets/interfaces";
import findEvent from "./findEvent";

export default function findConflicts (favesList: number[], favesMasterList: number[]) {
  var faveDetails: NewEvent[] = [];

  favesList.map((fave, index) => {
    var faveEvent = findEvent(fave),
        conflictingEvents: number[] = [];

    favesMasterList.map(val => {
      var valueEvent: NewEvent = findEvent(val);

      if (val != faveEvent.id) {
        // if val starts or ends at same time as fave
        if ((valueEvent.startTime === faveEvent.startTime
              && valueEvent.startDate === faveEvent.startDate) ||
            (valueEvent.endTime === faveEvent.endTime
              && valueEvent.endDate === faveEvent.endDate)) {
          conflictingEvents.push(val)
        }

        // if val starts during fave
        if (valueEvent.startDate === faveEvent.startDate &&
            (valueEvent.startTime >= faveEvent.startTime
              && valueEvent.startTime < faveEvent.endTime) &&
            !conflictingEvents.includes(val)) {
          conflictingEvents.push(val)
        }

        // if val ends during fave
        if (valueEvent.endDate === faveEvent.endDate &&
            (valueEvent.endTime < faveEvent.endTime
              && valueEvent.endTime >= faveEvent.startTime) &&
            !conflictingEvents.includes(val)) {
          conflictingEvents.push(val)
        }

        // if value starts before fave and ends after
        if (valueEvent.startTime <  faveEvent.startTime &&
            valueEvent.endTime > faveEvent.endTime &&
            valueEvent.startDate < faveEvent.startDate &&
            valueEvent.endDate >= faveEvent.endDate &&
            !conflictingEvents.includes(val)) {
          conflictingEvents.push(val)
        }

        // if fave ends on next day
        if (faveEvent.startDate != faveEvent.endDate) {
          // if val ends after fave start but before midnight
            if (valueEvent.startDate === faveEvent.startDate &&
                valueEvent.endTime >= faveEvent.startTime &&
                !conflictingEvents.includes(val)) {
            conflictingEvents.push(val)
          }
        }
      }
    })

    faveEvent.conflicts = conflictingEvents;

    faveDetails.push(faveEvent)
  })

  return faveDetails;
}