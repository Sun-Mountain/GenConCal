import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';

function DayContainer ({
  date,
  events
}) {
  const sortedEvents = events.sort(function(a,b){ return b.timeStart - a.timeStart; }).reverse()

  const [choices, setChoices] = useState([]);
  const [eventsList, setEventsList] = useState(sortedEvents);

  const findEvent = (id) => {
    const event = eventsList.find(event => event.gameId === id);
    return event;
  }

  const noConflict = (choice, event) => {
    if (
      event.timeStart.getTime() == choice.timeStart.getTime() &&
      event.timeEnd.getTime() == choice.timeEnd.getTime()
    ) {
      return false;
    }

    if (
      event.timeStart.getTime() > choice.timeStart &&
      event.timeEnd < choice.timeEnd
    ) {
      return false;
    }

    if (
      choice.timeStart > event.timeStart &&
      choice.timeEnd < event.timeEnd
    ) {
      return false;
    }

    return true;
  }

  const filterEvents = () => {
    var filteredList

    if (choices.length != 0) {
      choices.map(choice => {
        filteredList = eventsList.filter(event => ( noConflict(choice, event) ? event : null ));
      })
      filteredList.sort(function(a,b){ return b.timeStart - a.timeStart; }).reverse()
      setEventsList(filteredList);
    } else {
      setEventsList(sortedEvents);
    }
  }

  const addChoice = (e, gameId) => {
    const chosenEvent = findEvent(gameId);
    if (isNotInArray(choices, chosenEvent)) {
      var newChoices = choices;
      newChoices.push(chosenEvent);
      setChoices([...newChoices]);
    }

    filterEvents();
  }

  const removeChoice = (e, gameId) => {
    const chosenEvent = findEvent(gameId);
    var index = choices.indexOf(chosenEvent),
        newChoices = choices;
    newChoices.splice(index, 1)
    setChoices([...newChoices])

    filterEvents();

  }

  return (
    <li>
      <h3>{date}</h3>
      <div id="choices-list">
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
      </div>
    </li>
  )
};

export default DayContainer;