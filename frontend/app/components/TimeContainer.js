import { useState } from 'react';
import dynamic from 'next/dynamic';
import handleChoice from '@/helpers/handleChoice';

const Event = dynamic(() => import('./Event'));

function TimeContainer ({
  choices,
  setChoices,
  dailyTimes,
  setDailyTimes,
  events,
  time
}) {
  const [eventList, setEventList] = useState(events);

  const selectEvent = (gameId) => {
    var selectedEvent = eventList.find(event => event.gameId === gameId)
    handleChoice({
      action: 'addChoice',
      choices,
      setChoices,
      dailyTimes,
      setDailyTimes,
      selectedEvent
    })

    choices.map(choice => {
      setDailyTimes(dailyTimes.filter(time => {
        if (!(time >= choice.timeStart && time < choice.timeEnd)) {
          return time;
        }
      }));
    })
  }

  if (events) {
    return (
      <div>
        <span className="time-title">
          {time}
        </span>
        <div id="event-list">
          {eventList.map(event => {
            return <Event
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
            }
          )}
        </div>
      </div>
    )
  }
}

export default TimeContainer;