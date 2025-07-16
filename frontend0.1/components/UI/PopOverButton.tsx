import { MouseEvent, ReactNode, useState } from 'react';
import { Button, Popover } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

export function PopoverButton({
  numOfFaves,
  children
}: {
  numOfFaves: number;
  children: ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'favorite-events' : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant={numOfFaves ? 'contained' : 'outlined'} onClick={handleClick}>
        {numOfFaves ? (
          <>
            <Favorite style={{ color: '#d81159ff'}} />&nbsp;({numOfFaves})
          </>
        ) : (
          <FavoriteBorder style={{ color: '#d81159ff'}} />
        )}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className='fave-cards-container'>
          {numOfFaves ? (
            <>
              {children}
            </>
          ) : (
            <>
              You do not have any favorite events.
            </>
          )}
        </div>
      </Popover>
    </div>
  );
}