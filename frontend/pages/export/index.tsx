import { Dispatch, SetStateAction, Suspense } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { filteredEvents } from '@/pages/_app';
import { ClearFavoritesBtn, FaveCard } from '@/components';
import { findConflicts } from '@/helpers';

const {
  startDates: eventsListByDay,
  startTimes: eventsListByStartTime
} = filteredEvents;
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function ExportPage ({ setFaves }: { setFaves: Dispatch<SetStateAction<number[]>> }) {
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
    setFaves(newFaves)
    localStorage.setItem('faves', JSON.stringify(newFaves))
  }

  return (
    <>
      <div className='favorites-header'>
        <h1 className='schedule-page-title'>
          Schedule - {faves.length} Events
        </h1>
        <div className='btn-container'>
          <ClearFavoritesBtn setFaves={setFaves} />
        </div>
      </div>
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
                  <>{day} - {favesPerDay.length} Events</>
                </AccordionSummary>
                <AccordionDetails>
                  <>
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
                                return (
                                  // eslint-disable-next-line react/jsx-key
                                  <Suspense>
                                    <FaveCard key={index} favoriteEvent={fave} handleFaves={handleFaves}  />
                                  </Suspense>
                                )
                              })}
                            </div>
                          </ul>
                        )
                      }
                    })}
                  </>
                </AccordionDetails>
              </Accordion>
            )
          }
        })}
      </div>
    </>
  )
}