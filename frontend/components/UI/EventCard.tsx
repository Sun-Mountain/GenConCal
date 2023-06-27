import { NewEvent } from "@/assets/interfaces";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function EventCard({event}: {event: NewEvent}) {
  const {
    title,
    startDate,
    startTime,
    endDate,
    endTime,
    gameId,
    materials,
    ticketsAvailable,
    tournament,
  } = event;

  const startDay = (new Date(startDate)).toDateString();
  const endDay = (new Date(endDate)).toDateString();

  const multiDay = startDate != endDate;

  const dateTime = multiDay ? `${startDay},  ${startTime} - ${endDay} ${endTime}` : `${startDay} ${startTime} - ${endTime}`

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
            <DoNotDisturbIcon /> This Event is Sold Out
          </div>
        )}
        {multiDay && (
          <div className='fave-label'>
            <CalendarMonthIcon /> This Event is Multi-Day
          </div>
        )}
        {materials && (
          <div className='fave-label'>
            <ListAltIcon /> Materials Required
          </div>
        )}
        {tournament && (
          <div className='fave-label'>
            <EmojiEventsIcon /> Tournament Event
          </div>
        )}
      </CardContent>
      {/* <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions> */}
    </Card>
  );
}
