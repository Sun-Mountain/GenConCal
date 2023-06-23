import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const TableRow = dynamic(() => import("@/components/UI/TableRow"), {
  loading: () => <b>Loading...</b>,
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
            // eslint-disable-next-line react/jsx-key
            <Suspense>
              <TableRow key={eventIndex} eventIndex={eventIndex} />
            </Suspense>
          )
        })}
      </tbody>
    </table>
  )
}