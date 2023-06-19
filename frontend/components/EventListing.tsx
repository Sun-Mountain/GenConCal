import { useState } from 'react';
import { eventData } from "@/pages";
import EventModal from '@/components/EventModal';
import IconButton from '@mui/material/IconButton';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export default function EventListing ({ eventIndex }: { eventIndex: number }) {
  const {
    title,
    duration,
    cost,
    maxTickets,
    ticketsAvailable
  } = eventData[eventIndex];
  const event = eventData[eventIndex];

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  const noTickets = ticketsAvailable === 0;

  return (
    <div className={`event-listing${noTickets ? ' sold-out' : ''}`}>
      <div className='flex-row'>
        <div className='event-title-container'>
          {title}
        </div>
      </div>
      <EventModal open={open} handleClose={handleClose} event={event} />
      <div className='event-details'>
        <div>
          <IconButton aria-label="zoom in icon" color="secondary" onClick={handleOpen}>
            <ZoomInIcon />
          </IconButton>
          <IconButton aria-label="playlist add icon" color="primary">
            <PlaylistAddIcon />
          </IconButton>
        </div>
        <div className='tickets-column'>
          {ticketsAvailable}/{maxTickets}
        </div>
        <div className='duration-column'>
          {duration} {durationPrefix}
        </div>
        <div className='cost-column'>
          ${cost}
        </div>
      </div>
    </div>
  );
}