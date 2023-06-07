import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';

function TimeContainer ({
  choices,
  setChoices,
  events,
  time
}) {
  const [eventList, setEventList] = useState(events);

  // const handleChoice = (id) => {
  //   var selectedEvent = eventList.find(event => event.gameId === id),
  //       newChoices = choices;
  //   if (isNotInArray(choices, selectedEvent)) {
  //     newChoices.push(selectedEvent)
  //   }
  //   setChoices([...newChoices])
  // }

  if (events) {
    return (
      <div>
        <span className="time-title">
          {time}
        </span>
        <div id="event-list">
          {eventList.map(event => {
            return (
              <>
                { ageReq && (
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
                  />
                )}
              </>
            )}
          )}
        </div>
      </div>
    )
  }
}

export default TimeContainer;