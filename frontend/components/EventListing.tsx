import { eventData } from "@/pages";

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
      <div className='event-title-container'>
        {title}
      </div>
      <div className='event-details'>
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