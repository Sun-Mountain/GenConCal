import dynamic from 'next/dynamic';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const EventListing = dynamic(() => import("@/components/UI/EventListing"), {
  loading: () => <div>Loading...</div>,
});

export default function DataTable ({ events }: { events: number[]}) {

  return (
    <table className='event-data-table'>
      <thead>
        <tr>
          <th className='title-column'>
            Event Title
          </th>
          <th className='zoom-column'>
            <ZoomInIcon />
          </th>
          <th className='tickets-column'>
            Tickets
          </th>
          <th className='duration-column'>
            Duration
          </th>
          <th className='cost-column'>
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {events.map(eventIndex => {
          return (
            <EventListing key={eventIndex} eventIndex={eventIndex} />
          )
        })}
      </tbody>
    </table>
  )
}