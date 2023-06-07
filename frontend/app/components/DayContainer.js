import { useEffect, useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import TimeContainer from './TimeContainer';
import Event from './Event';

function DayContainer ({
  events,
  date,
  timesList
}) {
  const [choices, setChoices] = useState([])
  const noChoices = choices.length === 0;

  const handleChoice = (id) => {
    var selectedEvent = choices.find(event => event.gameId === id),
        newChoices = choices;
    newChoices.splice(selectedEvent, 1);
    setChoices([...newChoices])
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
              handleChoice={handleChoice}
              cost={event.cost}
              experience={event.experience}
              gameId={event.gameId}
              group={event.group}
              system={event.system}
              timeEnd={event.timeEnd}
              timeStart={event.timeStart}
              title={event.title}
              type={event.type}
            />
          )}
        </>
      ) }
      <hr />
      <div className="time-list">
        {timesList.map(time => (
          <TimeContainer
            key={time}
            choices={choices}
            setChoices={setChoices}
            events={events[time]}
            time={time}
          />
        ))}
      </div>
      {/* <div id="choices-list">
        {choices.map(event => (
          <Event
            key={`${event.gameId}`}
            system={event.system}
            timeEnd={event.timeEnd}
            timeStart={event.timeStart}
            title={event.title}
            handleChoice={e => removeChoice(e, event.gameId)}
          />
        ))}
      </div>
      <hr />
      <div id="event-list">
        <div>
          {eventsList.length} events
        </div>
        {eventsList.map(event => (
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
            handleChoice={e => addChoice(e, event.gameId)}
          />
        ))}
      </div> */}
    </li>
  )
};

export default DayContainer;