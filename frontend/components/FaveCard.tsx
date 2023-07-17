import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReportGmailErrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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
          gameSystem,
          gameId,
          tournament
        } = favoriteEvent;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const dateSubTitle = startDate === endDate ? `${startTime} - ${endTime}` : `${startDate} ${startTime} - ${endDate} ${endTime}`

  return (
    <Card
      // sx={{ maxWidth: 355 }}
      variant='outlined'
      className='fave-list-item'
    >
      <CardContent>
        <Typography className='fave-header'>
          <div>
            <div>
              {gameId}
            </div>
            <div className='fave-card-title'>
              {title}
            </div>
          </div>

          {conflicts && conflicts.length > 0 ? (
            <div className='conflicts-list conflicts-text'>
                <ExpandMore
                  expand={expanded}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                  className='conflicts-btn'
                >
                  <ReportGmailErrorredIcon /> Conflicts with {conflicts.length} Events {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon /> }
                </ExpandMore>
              <Collapse in={expanded} timeout="auto">
                <CardContent className=''>
                  {conflicts.map((conflict, index) => {
                    var conflictEvent = findEvent(conflict)
                    return (
                      <div key={index}>
                        {conflictEvent.title} - {conflictEvent.gameId}
                      </div>
                    )
                  })}
                </CardContent>
              </Collapse>
            </div>
          ) : (
            <div className='conflicts-text'>
              No conflicting events
            </div>
          )}
        </Typography>
        <Typography className='fave-details'>
          <span className='fave-date-times'>
            {dateSubTitle}
          </span>
          {location && (
            <span className='fave-location'>
              {location} {room && ` : ${room}`} {tableNum && tableNum > 0 ? ` : ${tableNum}` : ''}
            </span>
          )}
        </Typography>
        {gameSystem && (
          <Typography className='fave-system'>
            <strong>System</strong>: {gameSystem}
          </Typography>
        )}
        <Typography className='fave-description'>
          {descriptionShort}
        </Typography>
        <Typography>
          {tournament && (
            <>
              <EmojiEventsIcon /> Tournament
            </>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
}