'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Event from './components/Event';

import cleanData, { isNotInArray } from '@/helpers/cleanData';

const DayContainer = dynamic(() => import('./components/DayContainer'));

export default function Home() {
  const data = cleanData();

  const dates = Object.keys(data.events).sort();

  return (
    <main>
      <ul id="schedules-container">
        {dates.map(date => {
          return <DayContainer key={date} date={date} />
        })}
      </ul>
    </main>
  )

  // const [eventsList, setEventsList] = useState(data.events);
  // const [choices, setChoices] = useState([]);

  // const findEvent = (id) => {
  //   const event = eventsList.find(event => event.gameId === id);
  //   return event;
  // }

  // const noConflict = (choice, event) => {
  //   if (
  //     event.timeStart.getTime() >= choice.timeStart.getTime() &&
  //     event.timeEnd.getTime() <= choice.timeEnd.getTime()
  //   ) {
  //     return false;
  //   }

  //   if (
  //     choice.timeStart.getTime() >= event.timeStart.getTime() &&
  //     choice.timeEnd.getTime() <= event.timeEnd.getTime()
  //   ) {
  //     return false;
  //   }

  //   return true;
  // }

  // const filterEvents = () => {
  //   var filteredList

  //   choices.map(choice => {
  //     filteredList = eventsList.filter(event => ( noConflict(choice, event) ? event : null ));
  //   })

  //   filteredList.sort(function(a,b){ return b.timeStart - a.timeStart; }).reverse()

  //   setEventsList(filteredList);
  // }

  // const handleChoices = (e, gameId) => {
  //   e.preventDefault();
  //   const chosenEvent = findEvent(gameId);
  //   if (isNotInArray(choices, chosenEvent)) {
  //     var newChoices = choices;
  //     newChoices.push(chosenEvent);
  //     setChoices([...newChoices]);
  //   } else {
  //     var index = choices.indexOf(chosenEvent),
  //         newChoices = choices;
  //     newChoices.splice(index, 1)
  //     setChoices([...newChoices])
  //   }

  //   filterEvents();
  // }


  // return (
  //   <main>
  //     <div id="event-list">
  //       {eventsList.map(event => (
  //         <Event
  //           key={`${event.gameId}`}
  //           ageReq={event.ageReq}
  //           cost={event.cost}
  //           experience={event.experience}
  //           gameId={event.gameId}
  //           group={event.group}
  //           system={event.system}
  //           timeEnd={event.timeEnd}
  //           timeStart={event.timeStart}
  //           title={event.title}
  //           type={event.type}
  //           handleChoices={e => handleChoices(e, event.gameId)}
  //         />
  //       ))}
  //     </div>
  //     <div>
  //       {choices.map(event => (
  //         <Event
  //           key={`${event.gameId}`}
  //           ageReq={event.ageReq}
  //           cost={event.cost}
  //           experience={event.experience}
  //           gameId={event.gameId}
  //           group={event.group}
  //           system={event.system}
  //           timeEnd={event.timeEnd}
  //           timeStart={event.timeStart}
  //           title={event.title}
  //           type={event.type}
  //           handleChoices={e => handleChoices(e, event.gameId)}
  //         />
  //       ))}
  //     </div>
  //   </main>
  // )
}
