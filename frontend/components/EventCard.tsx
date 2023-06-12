import Image from "next/image";
import { eventData } from "@/pages";
import { Suspense } from "react";

export default function EventCard({eventIndex}: {eventIndex: number}) {
  const { gameId, title, startTime, endTime, eventType, gameSystem, duration, cost } = eventData[eventIndex];

  const iconPath = `/icons/${eventType.substring(0,3)}.gif`

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  return (
    <div className='event-card'>
      <div className='event-title-type'>
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
      </div>
      <div className='event-details'>
        <div className='event-detail margin-auto'>
          ${cost}
        </div>
        <div className='event-detail event-time margin-auto'>
          <strong>Time / Duration</strong><br />
          {startTime} - {endTime} / {duration} {durationPrefix}
        </div>
        <Suspense>
          <Image alt={`${eventType} Logo`} className='icon margin-auto' src={iconPath} width={64} height={64} />
        </Suspense>
      </div>
    </div>
  );
}