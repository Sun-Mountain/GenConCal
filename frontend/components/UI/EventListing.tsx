import { useState } from 'react';

import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import EventModal from '@/components/EventModal';
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

  const [fave, setFave] = useState(includesFave(eventIndex))

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
        <EventModal eventIndex={eventIndex} />
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