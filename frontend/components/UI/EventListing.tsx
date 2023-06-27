import { MouseEvent, useState } from 'react';

import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ModalComponent from '@/components/UI/Modal';

import EventDetails from '@/components/EventDetails';
import { eventData } from '@/pages/_app';
import { EventListingProps } from '@/assets/interfaces';

export default function EventListing ({ eventIndex, includesFave, handleFaves }: EventListingProps) {
  const {
    title,
    duration,
    cost,
    playersMax,
    ticketsAvailable
  } = eventData[eventIndex];  

  const [open, setOpen] = useState(false);
  const [fave, setFave] = useState(includesFave(eventIndex))
  const handleOpen = () => setOpen(true);

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  const noTickets = ticketsAvailable === 0;

  const aFave = fave ? <FavoriteIcon style={{ color: '#d81159ff'}} /> : <FavoriteBorderIcon />;

  const toggleFave = () => {
    setFave(!fave)
    handleFaves(eventIndex)
  }

  return (
    <tr key={eventIndex} className={`${noTickets ? 'sold-out' : ''}`}>
      <td>
        {title}
      </td>
      <td>
        <IconButton
          className='icon-button favorite-event-icon'
          aria-label="zoom in icon"
          onClick={toggleFave}
        >
          {aFave}
        </IconButton>
      </td>
      <td className='center-items'>
        <ModalComponent open={open} setOpen={setOpen}>
          <EventDetails eventIndex={eventIndex} />
        </ModalComponent>
        <IconButton
          className='icon-button'
          aria-label="zoom in icon"
          color="secondary"
          onClick={handleOpen}
        >
          <ZoomInIcon />
        </IconButton>
      </td>
      <td className='center-items extra-column'>
        {ticketsAvailable} / {playersMax}
      </td>
      <td className='center-items extra-column'>
        {duration} {durationPrefix}
      </td>
      <td className='center-items extra-column'>
        ${cost}
      </td>
    </tr>
  )
}