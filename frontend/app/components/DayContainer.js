import { useEffect, useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';
import handleChoice from '@/helpers/handleChoice';

const TimeContainer = dynamic(() => import('./TimeContainer'));

const resetDailies = (choices, setDailyTimes, timesList) => {
  choices.map(choice => {
    setDailyTimes(timesList.filter(time => {
      if (!(time >= choice.timeStart && time < choice.timeEnd)) {
        return time;
      }
    }));
  })
}

function DayContainer ({
  events,
  date,
  dayStart,
  dayEnd,
  timesList
}) {
  const [choices, setChoices] = useState([])
  const [dailyTimes, setDailyTimes] = useState(timesList);
  const noChoices = choices.length === 0;

  async function selectEvent (gameId) {
    var selectedEvent = choices.find(event => event.gameId === gameId)
    await handleChoice({
      action: 'removeChoice',
      choices,
      setChoices,
      selectedEvent,
      dailyTimes: timesList,
      setDailyTimes,
      gameId
    })
    await resetDailies(choices, setDailyTimes, timesList);
  }

  return (
    <li>
      <h3>{date}</h3>
      { noChoices ? (
        <>
          No choices have been selected for today.
        </>
      ) : (
        <>
          {choices.map(event => {
            return (
              <Event
                key={`${event.gameId}`}
                cost={event.cost}
                experience={event.experience}
                gameId={event.gameId}
                group={event.group}
                system={event.system}
                timeEnd={event.timeEnd}
                timeStart={event.timeStart}
                title={event.title}
                type={event.type}
                selectEvent={selectEvent}
              />
            )
          })}
        </>
      ) }
      <hr />
      <div className="time-list">
        {dailyTimes.map(time => {
          if (time >= dayStart && time <= dayEnd) {
            return (
              <TimeContainer
                key={time}
                choices={choices}
                setChoices={setChoices}
                dailyTimes={dailyTimes}
                setDailyTimes={setDailyTimes}
                events={events[time]}
                time={time}
              />
            )
          }
        })}
      </div>
    </li>
  )
};

export default DayContainer;