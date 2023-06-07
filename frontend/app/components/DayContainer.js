import { useEffect, useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import TimeContainer from './TimeContainer';

const filterTime = (startTime, timesList, setTimesList) => {
  if (!isNotInArray(timesList, startTime)) {
    var index = timesList.indexOf(startTime),
        newTimes = timesList;
    if(index !== -1) {
        return newTimes.splice(index, newTimes.length - 1);
    }
    setTimesList(newTimes);
  }
}

function DayContainer ({
  events,
  date,
  hiddenReqs,
  timesList
}) {
  return (
    <li>
      <h3>{date}</h3>
      <div className="time-list">
        {timesList.map(time => (
          <TimeContainer
            key={time}
            events={events[time]}
            hiddenReqs={hiddenReqs}
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