import { KeyboardEvent, MouseEvent, ReactNode, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import IconButton from '@mui/material/IconButton';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

export default function DrawerComponent({ children }: { children: ReactNode }) {
  const [state, setState] = useState(false);

  const toggleDrawer =
    (open: boolean) =>
    (event: KeyboardEvent | MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as KeyboardEvent).key === 'Tab' ||
          (event as KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState(open);
    };

  return (
    <>
      <Button id='filter-btn' onClick={toggleDrawer(true)} startIcon={<FilterAltIcon />}> Filter Events</Button>
      <Drawer
        anchor='top'
        open={state}
        onClose={toggleDrawer(false)}
      >
        {children}
        <IconButton onClick={toggleDrawer(false)} aria-label="close drawer" size="large">
          <KeyboardDoubleArrowUpIcon fontSize="inherit" />
        </IconButton>
      </Drawer>
    </>
  );
}