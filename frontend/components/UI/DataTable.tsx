import dynamic from 'next/dynamic';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { DataTableProps } from '@/assets/interfaces';

const EventListing = dynamic(() => import("@/components/UI/EventListing"), {
  loading: () => <div>Loading...</div>,
});

export default function DataTable ({ events, includesFave, handleFaves }: DataTableProps) {

  return (
    <table className='event-data-table'>
      <thead>
        <tr>
          <th className='title-column'>
            Event Title
          </th>
          <th className='icon-column'>
            <FavoriteIcon />
          </th>
          <th className='icon-column'>
            <ZoomInIcon />
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
              includesFave={includesFave}
              handleFaves={handleFaves} />
          )
        })}
      </tbody>
    </table>
  )
}