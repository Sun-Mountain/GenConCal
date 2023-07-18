import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReportGmailErrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import DeleteIcon from '@mui/icons-material/Delete';

import EventModal from '@/components/EventModal';

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

export default function FaveCard ({ favoriteEvent, handleFaves }: { favoriteEvent: NewEvent, handleFaves: Function }) {
  const [expanded, setExpanded] = useState(false);
  const { 
    conflicts,
    descriptionShort,
    endDate,
    endTime,
    gameId,
    gameSystem,
    id,
    location,
    materials,
    room,
    startDate,
    startTime,
    tableNum,
    ticketsAvailable,
    title,
    tournament,
  } = favoriteEvent;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDeleteFave = () => {
    handleFaves(id)
  }

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
            <div className='fave-game-id'>
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
              <Collapse in={expanded} timeout="auto" unmountOnExit>
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
        <Typography className='badges-and-details'>
          <div className='badge-container'>
            {!ticketsAvailable && (
              <div className='fave-badge sold-out-badge'>
                <DoNotDisturbIcon className='badge-icon' fontSize='small' /> Event Sold Out
              </div>
            )}
            {endDate != startDate && (
              <div className='fave-badge diff-day-badge'>
                <CalendarMonthIcon className='badge-icon' fontSize='small' /> Ends on a Different Day
              </div>
            )}
            {materials && (
              <div className='fave-badge materials-badge'>
                <DesignServicesIcon className='badge-icon' fontSize='small' /> Materials Required
              </div>
            )}
            {tournament && (
              <div className='fave-badge tournament-badge'>
                <EmojiEventsIcon className='badge-icon' fontSize='small' /> Tournament
              </div>
            )}
          </div>

          <div className='action-buttons'>
            <div className='button-container'>
              <EventModal eventIndex={id} showLabel={true} size='medium' />
            </div>
            <div className='button-container'>
              <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteFave}>
                Delete
              </Button>
            </div>
          </div>
        </Typography>
      </CardContent>
    </Card>
  );
}