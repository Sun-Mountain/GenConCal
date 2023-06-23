import { eventData } from '@/pages/_app';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export default function TableRow ({ eventIndex }: { eventIndex: number }) {
  const {
    title,
    duration,
    cost,
    playersMax,
    ticketsAvailable
  } = eventData[eventIndex];  
  return (
    <tr key={eventIndex} className={`${ticketsAvailable > 0 ? '' : 'sold-out'}`}>
      <td>
        {title}
      </td>
      <td className='center-items'>
        <ZoomInIcon />
      </td>
      <td className='center-items'>
        {ticketsAvailable} / {playersMax}
      </td>
      <td className='center-items'>
        {duration} {duration <= 1 ? 'hr' : 'hrs'}
      </td>
      <td className='center-items'>
        ${cost}
      </td>
    </tr>
  )
}