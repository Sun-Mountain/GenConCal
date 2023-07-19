import dynamic from 'next/dynamic';
import { ZoomIn, Favorite } from '@mui/icons-material';
import { DataTableProps } from '@/assets/interfaces';

const EventListing = dynamic(() => import('@/components/UI/EventListing'));

export function DataTable ({ events, handleFaves, includesFave }: DataTableProps) {

  return (
    <table className='event-data-table'>
      <thead>
        <tr>
          <th className='title-column'>
            Event Title
          </th>
          <th className='icon-column'>
            <Favorite />
          </th>
          <th className='icon-column'>
            <ZoomIn />
          </th>
          <th className='tickets-column extra-column'>
            Tickets
          </th>
          <th className='duration-column extra-column'>
            Duration
          </th>
          <th className='cost-column extra-column'>
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {events.map(eventIndex => {
          return (
            <EventListing
              key={eventIndex}
              eventIndex={eventIndex}
              handleFaves={handleFaves}
              includesFave={includesFave} />
          )
        })}
      </tbody>
    </table>
  )
}