import { Fragment } from 'react';
import { NewEvent } from '@/helpers/getData';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

const card = (
  gameId: string,
  title: string,
  startTime: string,
  endTime: string,
  gameSystem?: string,
) => (
  <Fragment>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {gameId.slice(7)}
      </Typography>
      <Typography variant="h5" component="div">
        {title}
      </Typography>
      {gameSystem && (
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {gameSystem}
        </Typography>
      )}
      <Typography sx={{ mb: 1.5 }}>
        {startTime} - {endTime}
      </Typography>
      <Typography variant="body2">
        well meaning and kindly.
        <br />
        {'"a benevolent smile"'}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Fragment>
);

export default function EventCard({
  gameId,
  group,
  title,
  eventType,
  gameSystem,
  ageRequirement,
  experienceRequirement,
  startDate,
  startTime,
  endDate,
  endTime,
  tournament,
  cost,
  location,
  ticketsAvailable
}: NewEvent) {
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined">{card(gameId, title, startTime, endTime, gameSystem)}</Card>
    </Box>
  );
}