import Image from "next/image";
import { eventData } from "@/pages";
import { Suspense } from "react";

export default function EventCard({eventIndex}: {eventIndex: number}) {
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

  const iconPath = `/icons/${eventType.substring(0,3)}.gif`

  const durationPrefix = duration > 1 ? 'hrs' : 'hr';

  return (
    <div className='event-listing'>
      <div>
        {title}
      </div>
      <div className='event-details'>
        <div className='tickets-column'>
          {ticketsAvailable}/{maxTickets}
        </div>
        <div className='duration-column'>
          {startTime} - {endTime} <strong>/</strong> {duration} {durationPrefix}
        </div>
        <div className='cost-column'>
          ${cost}
        </div>
      </div>
    </div>
  );
}