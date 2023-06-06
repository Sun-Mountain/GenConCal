'use client';
import { useState } from 'react';
import Event from './components/Event';

import cleanData, { isNotInArray } from '@/helpers/cleanData';

export default function Home() {
  const data = cleanData();

  const [eventsList, setEventsList] = useState(data.events);
  const [choices, setChoices] = useState([]);

  // const filterEvents = (choices) => {
  //   choices.map(choice => {
  //     var chosenEvent = eventsList.filter(event => event.gameId === choice);
  //     console.log(chosenEvent[0])
  //   })
  // }

  const findEvent = (id) => {
    const event = eventsList.filter(event => event.gameId === id);
    return event[0]
  }

  const handleChoices = (e, gameId) => {
    e.preventDefault();
    const chosenEvent = findEvent(gameId);
    if (isNotInArray(choices, chosenEvent)) {
      var newChoices = choices;
      newChoices.push(chosenEvent);
      setChoices([...newChoices]);
    } else {
      var index = choices.indexOf(chosenEvent),
          newChoices = choices;
      newChoices.splice(index, 1)
      setChoices([...newChoices])
    }

    console.log(choices)
  }


  return (
    <main>
      <div id="event-list">
        {eventsList.map(event => (
          <Event
            key={`${event.gameId}`}
            ageReq={event.ageReq}
            cost={event.cost}
            experience={event.experience}
            gameId={event.gameId}
            group={event.group}
            system={event.system}
            timeEnd={event.timeEnd}
            timeStart={event.timeStart}
            title={event.title}
            type={event.type}
            handleChoices={e => handleChoices(e, event.gameId)}
          />
        ))}
      </div>
      <div>
        {choices.map(event => (
          <Event
            key={`${event.gameId}`}
            ageReq={event.ageReq}
            cost={event.cost}
            experience={event.experience}
            gameId={event.gameId}
            group={event.group}
            system={event.system}
            timeEnd={event.timeEnd}
            timeStart={event.timeStart}
            title={event.title}
            type={event.type}
            handleChoices={e => handleChoices(e, event.gameId)}
          />
        ))}
      </div>
    </main>
  )
}
