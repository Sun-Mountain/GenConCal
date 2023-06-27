import { NewEvent } from "@/assets/interfaces";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

export default function EventCard({event}: {event: NewEvent}) {
  const {
    title,
    startDate,
    startTime,
    endDate,
    endTime
  } = event;

  const startDay = (new Date(startDate)).toDateString();
  const endDay = (new Date(endDate)).toDateString();

  const dateTime = startDate != endDate ? `${startDay},  ${startTime} - ${endDay} ${endTime}` : `${startDay} ${startTime} - ${endTime}`

  return (
    <Card className='fave-card' sx={{ minWidth: 275 }}>
      <CardContent className="fave-content">
        <div className='fave-title'>{title}</div>
        <div className='fave-date-container'>
          {dateTime}
        </div>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}
