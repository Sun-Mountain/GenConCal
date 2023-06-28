import Card from '@mui/material/Card';
import { CardActions, CardContent } from '@mui/material';
import { CalendarMonth, DoNotDisturb, EmojiEvents, ListAlt } from '@mui/icons-material/';

import { NewEvent } from "@/assets/interfaces";

import EventModal from '@/components/EventModal';

export default function EventCard({ event }: { event: NewEvent; }) {
  const {
    title,
    startDate,
    startTime,
    endDate,
    endTime,
    gameId,
    id,
    materials,
    ticketsAvailable,
    tournament,
  } = event;

  const startDay = (new Date(startDate)).toDateString();
  const endDay = (new Date(endDate)).toDateString();

  const multiDay = startDate != endDate;

  const dateTime = multiDay ? `${startDay},  ${startTime} - ${endDay} ${endTime}` : `${startDay} ${startTime} - ${endTime}`;

  return (
    <Card className='fave-card' sx={{ minWidth: 275 }}>
      <CardContent className="fave-content">
        <div className='fave-id'>{gameId}</div>
        <div className='fave-title'>{title}</div>
        <div className='fave-date-container'>
          {dateTime}
        </div>
        {!ticketsAvailable && (
          <div className='fave-label'>
            <DoNotDisturb /> This Event is Sold Out
          </div>
        )}
        {multiDay && (
          <div className='fave-label'>
            <CalendarMonth /> This Event is Multi-Day
          </div>
        )}
        {materials && (
          <div className='fave-label'>
            <ListAlt /> Materials Required
          </div>
        )}
        {tournament && (
          <div className='fave-label'>
            <EmojiEvents /> Tournament Event
          </div>
        )}
      </CardContent>
      <CardActions>
        <EventModal eventIndex={id} showLabel={true} />
      </CardActions>
    </Card>
  );
}
