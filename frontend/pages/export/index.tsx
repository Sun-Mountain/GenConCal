import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { filteredEvents } from "@/pages/_app";
import findEvent from "@/helpers/findEvent";
import { NewEvent } from "@/assets/interfaces";
import FaveCard from '@/components/FaveCard';

const eventsListByDay = filteredEvents.startDates;
const eventsListByStartTime = filteredEvents.startTimes;
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

const findConflicts = (favesList: number[], favesMasterList: number[]) => {
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

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  const getFaves = (day: string) => {
    const dayFaves = eventsListByDay[day]
    var favesForDay = dayFaves;

    favesForDay = favesForDay.filter(val => faves.includes(val));

    return favesForDay;
  }

  return (
    <>
      Export
      <div className='schedule-container'>
        {dayLabels.map((day, index) => {
          var favesPerDay = getFaves(day);

          if (favesPerDay.length) {
            return (
              <Accordion
                className=''
                defaultExpanded={true} key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{day} - {favesPerDay.length} Events</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {timeLabels.map((time, index) => {
                      const favesPerTime = favesPerDay.filter(val => eventsListByStartTime[time].includes(val));

                      const faveEventsList = findConflicts(favesPerTime, faves)

                      if (favesPerTime.length) {
                        return (
                          <ul className='schedule-list-time' key={index}>
                            <li className='time-title'>
                              {time}
                            </li>
                            <div className='fave-list'>
                              {faveEventsList.map((fave, index) => {
                                return <FaveCard key={index} favoriteEvent={fave}  />
                              })}
                            </div>
                          </ul>
                        )
                      }
                    })}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )
          }
        })}
      </div>
    </>
  )
}