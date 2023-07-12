import { MouseEvent, ReactNode, useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function PopoverButton({
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
            <FavoriteIcon style={{ color: '#d81159ff'}} />&nbsp;({numOfFaves})
          </>
        ) : (
          <FavoriteBorderIcon style={{ color: '#d81159ff'}} />
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
        <Typography sx={{ p: 2 }}>
          {numOfFaves ? (
            <>
              {children}
            </>
          ) : (
            <>
              You do not have any favorite events.
            </>
          )}
        </Typography>
      </Popover>
    </div>
  );
}