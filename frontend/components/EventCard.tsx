import { eventData } from "@/pages";

export default function EventCard({eventIndex}: {eventIndex: number}) {
  const { gameId, title, startTime, endTime, gameSystem } = eventData[eventIndex];
  return (
    <div className='event-card'>
      <div className='card-text-secondary'>
        {gameId.slice(7)}
      </div>
      <h3 className='event-card-title'>
        {title}
      </h3>
      {gameSystem && (
        <div className='event-card-sub-title'>
          {gameSystem}
        </div>
      )}
      <div className='event-container'>
        {startTime} - {endTime}
      </div>
    </div>
  );
}