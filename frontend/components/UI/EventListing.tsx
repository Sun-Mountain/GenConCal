import { useState } from 'react';
import ModalComponent from '@/components/UI/Modal';
import EventDetails from '@/components/EventDetails';
import { eventData } from '@/pages/_app';
import IconButton from '@mui/material/IconButton'
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export default function EventListing ({ eventIndex }: { eventIndex: number }) {
  const {
    title,
    duration,
    cost,
    playersMax,
    ticketsAvailable
  } = eventData[eventIndex];  

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  const noTickets = ticketsAvailable === 0;

  return (
    <tr key={eventIndex} className={`${noTickets ? 'sold-out' : ''}`}>
      <td>
        {title}
      </td>
      <td className='center-items'>
        <ModalComponent open={open} setOpen={setOpen}>
          <EventDetails eventIndex={eventIndex} />
        </ModalComponent>
        <IconButton className='icon-button' aria-label="zoom in icon" color="secondary" onClick={handleOpen}>
          <ZoomInIcon />
        </IconButton>
      </td>
      <td className='center-items'>
        {ticketsAvailable} / {playersMax}
      </td>
      <td className='center-items'>
        {duration} {durationPrefix}
      </td>
      <td className='center-items'>
        ${cost}
      </td>
    </tr>
  )
}