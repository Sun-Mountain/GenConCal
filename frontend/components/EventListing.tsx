import { Suspense, useState } from 'react';
import { IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { eventData } from '@/pages/_app';
import { EventListingProps } from '@/assets/interfaces';
import { EventModal } from '@/components';

export default function EventListing ({ eventIndex, includesFave, handleFaves }: EventListingProps) {
  const {
    title,
    duration,
    cost,
    playersMax,
    ticketsAvailable
  } = eventData[eventIndex];
  const [buttonLoading, setButtonLoading] = useState(false);

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  const noTickets = ticketsAvailable === 0;

  const aFave = includesFave(eventIndex) ? <Favorite style={{ color: '#d81159ff'}} /> : <FavoriteBorder />;

  const toggleFave = () => {
    setButtonLoading(!buttonLoading)
    handleFaves(eventIndex)
    setButtonLoading(!!buttonLoading)
  }

  return (
    <tr key={eventIndex} className={`${noTickets ? 'sold-out' : ''}`}>
      <td>
        {title}
      </td>
      <td>
        <Suspense>
          <IconButton
            className='icon-button favorite-event-icon'
            aria-label="zoom in icon"
            disabled={buttonLoading}
            onClick={toggleFave}
          >
            {aFave}
          </IconButton>
        </Suspense>
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