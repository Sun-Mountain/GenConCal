import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { NewEvent } from '@/assets/interfaces';
import findEvent from '@/helpers/findEvent';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function FaveCard ({ favoriteEvent }: { favoriteEvent: NewEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { title,
          descriptionShort,
          startDate,
          startTime,
          endDate,
          endTime,
          conflicts,
          location,
          room,
          tableNum,
          gameSystem
        } = favoriteEvent;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const dateSubTitle = startDate === endDate ? `${startTime} - ${endTime}` : `${startDate} ${startTime} - ${endDate} ${endTime}`

  return (
    <Card
      sx={{ maxWidth: 345 }}
      variant='outlined'
      className='fave-list-item'
    >
      <CardContent>
        <Typography className='fave-title'>
          {title}
        </Typography>
        <Typography className='faveStartAndEnd fave-detail'>
          {dateSubTitle}
        </Typography>
        {location && (
          <Typography className='fave-location fave-detail'>
            {location} {room && ` : ${room}`} {tableNum && tableNum > 0 ? ` : ${tableNum}` : ''}
          </Typography>
        )}
        {gameSystem && (
          <Typography className='fave-system'>
            <strong>System</strong>: {gameSystem}
          </Typography>
        )}
        <Typography className='fave-description'>
          {descriptionShort}
        </Typography>
      </CardContent>
      {conflicts && conflicts.length > 0 && (
        <>
          <CardActions disableSpacing>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              className='conflicts-btn'
            >
              Conflicts with {conflicts.length} Events {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon /> }
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              {conflicts.map((conflict, index) => {
                var conflictEvent = findEvent(conflict)
                return (
                  <div key={index}>
                    {conflictEvent.title}
                  </div>
                )
              })}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  );
}