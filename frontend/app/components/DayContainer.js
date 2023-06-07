import { useEffect, useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';
import handleChoice from '@/helpers/handleChoice';

const TimeContainer = dynamic(() => import('./TimeContainer'));

function DayContainer ({
  events,
  date,
  dayStart,
  dayEnd,
  timesList
}) {
  const [choices, setChoices] = useState([])
  const noChoices = choices.length === 0;

  const selectEvent = (gameId) => {
    var selectedEvent = choices.find(event => event.gameId === gameId)
    handleChoice({
      action: 'removeChoice',
      choices,
      setChoices,
      selectedEvent,
      gameId
    })
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
          {choices.map(event => 
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
          )}
        </>
      ) }
      <hr />
      <div className="time-list">
        {timesList.map(time => {
          if (time >= dayStart && time <= dayEnd) {
            return (
              <TimeContainer
                key={time}
                choices={choices}
                setChoices={setChoices}
                events={events[time]}
                dayStart={dayStart}
                dayEnd={dayEnd}
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