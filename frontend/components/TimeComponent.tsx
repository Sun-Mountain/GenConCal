import dynamic from 'next/dynamic';
import { NewEvent } from '@/helpers/getData';

const EventListing = dynamic(() => import("./EventListing"), {
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
        <div className='event-listing listing-header'>
          <div>
            Title
          </div>
          <div className='event-details'>
            <div className='tickets-column'>
              Tickets
            </div>
            <div className='duration-column'>
              Duration
            </div>
            <div className='cost-column'>
              Cost
            </div>
          </div>
        </div>
        {events.map((eventIndex: number) => {
          return <EventListing key={eventIndex} eventIndex={eventIndex} />
        })}
      </div>
    </div>
  )
}