import { eventData } from "@/pages";
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

export default function EventListing ({eventIndex}: {eventIndex: number}) {
  const {
    gameId,
    title,
    startTime,
    endTime,
    eventType,
    gameSystem,
    duration,
    cost,
    maxTickets,
    ticketsAvailable
  } = eventData[eventIndex];

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  const noTickets = ticketsAvailable === 0;

  return (
    <div className={`event-listing${noTickets ? ' sold-out' : ''}`}>
      <div className='flex-row'>
        {/* <div className="add-button-column">
          <div>
            <IconButton aria-label="add icon" color="secondary">
              <AddIcon />
            </IconButton>
          </div>
        </div> */}
        <div className='event-title-container'>
          {title}
        </div>
      </div>
      <div className='event-details'>
        <IconButton aria-label="zoom in icon" color="secondary">
          <ZoomInIcon />
        </IconButton>
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