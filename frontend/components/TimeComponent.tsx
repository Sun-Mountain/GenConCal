import { Dispatch, SetStateAction, Suspense } from 'react';
import { NewEvent } from '@/helpers/getData';
import EventCard from './EventCard';

interface TimeComponent {
  events: number[],
  eventData: NewEvent[],
  time: string
}

export default function DailyTimeComponent ({
  events,
  eventData,
  time
}: TimeComponent) {
  return (
    <div>
      <span className="time-title">
        {time}
      </span>
      <div className="event-list">
        {events.map((event: number, index: number) => {
          const singleEvent = eventData[event];
          return (
            <Suspense key={index}>
              <EventCard {...singleEvent} />
            </Suspense>
          )
        })}
      </div>
    </div>
  )
}