import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { filteredEvents } from '@/pages/_app';
import findConflicts from '@/helpers/findConflicts';
import FaveCard from '@/components/FaveCard';

const eventsListByDay = filteredEvents.startDates;
const eventsListByStartTime = filteredEvents.startTimes;
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  const getFaves = (day: string) => {
    const dayFaves = eventsListByDay[day]
    var favesForDay = dayFaves;

    favesForDay = favesForDay.filter(val => faves.includes(val));

    return favesForDay;
  }

  const handleFaves = async (eventIndex: number) => {
    var newFaves = faves;
    if (newFaves.includes(eventIndex)) {
      var index = newFaves.indexOf(eventIndex);
      newFaves.splice(index, 1);
    } else {
      newFaves.push(eventIndex);
    }
    localStorage.setItem('faves', JSON.stringify(newFaves))
  }

  return (
    <>
      <h1 className='schedule-page-title'>
        Schedule - {faves.length} Events
      </h1>
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
                                return <FaveCard key={index} favoriteEvent={fave} handleFaves={handleFaves}  />
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