import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  IconButtonProps,
  styled
} from '@mui/material';
import {
  CalendarMonth,
  Delete,
  DesignServices,
  DoNotDisturb,
  EmojiEvents,
  ExpandLess,
  ExpandMore,
  ReportGmailerrorred,
} from '@mui/icons-material/';

import { NewEvent } from '@/assets/interfaces';
import { EventModal } from '@/components';
import findEvent from '@/helpers/findEvent';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMoreComponent = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(() => ({
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
        <div className='fave-header'>
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
                <ExpandMoreComponent
                  expand={expanded}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                  className='conflicts-btn'
                >
                  <ReportGmailerrorred /> Conflicts with {conflicts.length} Events {expanded ? <ExpandLess /> : <ExpandMore /> }
                </ExpandMoreComponent>
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
        </div>
        <div className='fave-details'>
          <span className='fave-date-times'>
            {dateSubTitle}
          </span>
          {location && (
            <span className='fave-location'>
              {location} {room && ` : ${room}`} {tableNum && tableNum > 0 ? ` : ${tableNum}` : ''}
            </span>
          )}
        </div>
        {gameSystem && (
          <div className='fave-system'>
            <strong>System</strong>: {gameSystem}
          </div>
        )}
        <div className='fave-description'>
          {descriptionShort}
        </div>
        <div className='badges-and-details'>
          <div className='badge-container'>
            {!ticketsAvailable && (
              <div className='fave-badge sold-out-badge'>
                <DoNotDisturb className='badge-icon' fontSize='small' /> Event Sold Out
              </div>
            )}
            {endDate != startDate && (
              <div className='fave-badge diff-day-badge'>
                <CalendarMonth className='badge-icon' fontSize='small' /> Ends on a Different Day
              </div>
            )}
            {materials && (
              <div className='fave-badge materials-badge'>
                <DesignServices className='badge-icon' fontSize='small' /> Materials Required
              </div>
            )}
            {tournament && (
              <div className='fave-badge tournament-badge'>
                <EmojiEvents className='badge-icon' fontSize='small' /> Tournament
              </div>
            )}
          </div>

          <div className='action-buttons'>
            <div className='button-container'>
              <EventModal eventIndex={id} showLabel={true} size='medium' />
            </div>
            <div className='button-container'>
              <Button variant="contained" startIcon={<Delete />} onClick={handleDeleteFave}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}