import { useState } from 'react';
import { Button, IconButton} from '@mui/material';
import { Close, ZoomIn } from '@mui/icons-material';
import { EventDetails, ModalComponent } from '@/components';

export function EventModal ({ eventIndex, showLabel, size }: { eventIndex: number, showLabel?: boolean, size?: 'small' | 'medium' | 'large' }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <ModalComponent open={open} setOpen={setOpen}>
        <div className='modal-close-btn-container'>
          <Button startIcon={<Close /> } onClick={handleClose}>Close Modal</Button>
        </div>
        <EventDetails eventIndex={eventIndex} />
      </ModalComponent>
      {showLabel ? (
        <>
          <Button
            aria-label="zoom in icon"
            className='modal-button'
            color="secondary"
            size={size ? size : 'small'}
            variant='outlined'
            onClick={handleOpen}
          >
            <ZoomIn />
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
            <ZoomIn />
          </IconButton>
        </>
      )}
    </>
  )
}