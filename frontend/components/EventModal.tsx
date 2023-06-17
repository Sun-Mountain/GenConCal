import { Dispatch, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TableRow from './TableRow';
import { NewEvent } from '@/helpers/getData';

const style = {
  width: {
    xs: 350, // theme.breakpoints.up('xs')
    sm: 600, // theme.breakpoints.up('sm')
    md: 600, // theme.breakpoints.up('md')
    lg: 800, // theme.breakpoints.up('lg')
    xl: 800, // theme.breakpoints.up('xl')
  },
  height: {
    xs: '75dvh', // theme.breakpoints.up('xs')
    sm: 500,
  },
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'scroll',
};

export default function BasicModal({
  open,
  handleClose,
  event
}: {
  open: boolean;
  handleClose: Dispatch<SetStateAction<boolean>>;
  event: NewEvent;
}) {

  return (
    <div className='modal-layer'>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <table className='modal-table'>
            <TableRow label='Title' value={event.title} />
            <TableRow label='Game Id' value={event.gameId} />
            <TableRow label='Start Date & Time' value={`${event.startDate} ${event.startTime}`} />
            <TableRow label='End Date & Time' value={`${event.endDate} ${event.endTime}`} />
            {event.shortDescription && <TableRow label='Short Description' value={event.shortDescription} />}
            {event.longDescription && <TableRow label='Long Description' value={event.longDescription} />}
            <TableRow label='Game Id' value={event.gameId} />
            <TableRow label='Cost' value={`$${event.cost}`} />
            {event.gameSystem && <TableRow label='Game System' value={event.gameSystem} />}
            <TableRow label='Age Requirement' value={event.ageRequirement} />
            <TableRow label='Experience Requirement' value={event.experienceRequirement} />
            {event.group && <TableRow label='Group' value={event.group} />}
            {event.location && <TableRow label='Location' value={event.location} />}
            <TableRow label='Tickets Available' value={`${event.ticketsAvailable}/${event.maxTickets}`} />
          </table>
        </Box>
      </Modal>
    </div>
  );
}