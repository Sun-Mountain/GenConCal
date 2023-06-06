'use client';
import { useState } from 'react';
import Event from './components/Event';

import cleanData from '@/helpers/cleanData';

export default function Home() {

  const data = cleanData();

  const [eventsList, setEventsList] = useState(data.events);
  const [choices, setChoices] = useState([]);


  return (
    <main>
      <div id="event-list">
        {eventsList.map(event => {
          return <Event
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
                    choices={choices}
                    setChoices={setChoices}
                  />
        })}
      </div>
    </main>
  )
}
