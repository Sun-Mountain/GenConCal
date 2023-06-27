import { useState } from 'react';
import ModalComponent from '@/components/UI/Modal';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import EventDetails from '@/components/EventDetails';

export default function EventModal ({ eventIndex, showLabel }: { eventIndex: number, showLabel?: boolean }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <ModalComponent open={open} setOpen={setOpen}>
        <EventDetails eventIndex={eventIndex} />
      </ModalComponent>
      {showLabel ? (
        <>
          <Button
            aria-label="zoom in icon"
            className='modal-button'
            color="secondary"
            size='small'
            variant='outlined'
            onClick={handleOpen}
          >
            <ZoomInIcon />
            Event Details
          </Button>
        </>
      ) : (
        <>
          <IconButton
            className='icon-button'
            aria-label="zoom in icon"
            color="secondary"
            onClick={handleOpen}
          >
            <ZoomInIcon />
          </IconButton>
        </>
      )}
    </>
  )
}