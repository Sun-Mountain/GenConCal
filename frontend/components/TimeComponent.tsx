import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TimeComponent } from '@/interfaces/Components';

const EventListing = dynamic(() => import("./EventListing"), {
  loading: () => <b>Loading...</b>,
});

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
          <div className='flex-row'>
            <div>
              Title
            </div>
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
          return (
            <Suspense key={eventIndex}>
              <EventListing key={eventIndex} eventIndex={eventIndex} />
            </Suspense>
          )
        })}
      </div>
    </div>
  )
}