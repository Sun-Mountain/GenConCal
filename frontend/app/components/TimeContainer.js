import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';

function TimeContainer ({
  events,
  hiddenReqs,
  time
}) {
  const [eventList, setEventList] = useState(events);

  if (events) {
    return (
      <div>
        <span className="time-title">
          {time}
        </span>
        <div id="event-list">
          {eventList.map(event => {
            var showEvent = hiddenReqs.length === 0 || hiddenReqs.includes(event.ageReq);
            return (
              <>
                { showEvent && (
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