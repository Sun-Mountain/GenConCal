import dynamic from 'next/dynamic';
import { NewEvent } from '@/helpers/getData';
// import EventCard from './EventCard';

const EventCard = dynamic(() => import("./EventCard"), {
  loading: () => <b>Loading...</b>,
});

interface TimeComponent {
  events: number[],
  time: string
}

export default function DailyTimeComponent ({
  events,
  time
}: TimeComponent) {
  return (
    <div>
      <h2 className="time-title">
        {time}
      </h2>
      <div className="event-list">
        {events.map((eventIndex: number) => {
          return (
              <EventCard key={eventIndex} eventIndex={eventIndex} />
          )
        })}
      </div>
    </div>
  )
}