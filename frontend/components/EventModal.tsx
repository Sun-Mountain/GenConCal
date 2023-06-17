import { Dispatch, SetStateAction } from 'react';
import { NewEvent } from '@/helpers/getData';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TableRow from './TableRow';
import Link from 'next/link';

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

  var gameId = event.gameId,
      eventLinkId = gameId.substring(7);

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
            <tr className="modal-table-row">
              <td className="table-label-container">
                Title
              </td>
              <td className="table-value-container">
                {event.title}<br />
                <Link
                  href={`https://www.gencon.com/events/${eventLinkId}`}
                  target="_blank"
                >
                  <ConfirmationNumberIcon /> Wishlist / Purchase Option
                </Link>
              </td>
            </tr>
            <TableRow label='Game Id' value={gameId} />
            <TableRow label='Start Date & Time' value={`${event.startDate} ${event.startTime}`} />
            <TableRow label='End Date & Time' value={`${event.endDate} ${event.endTime}`} />
            {event.shortDescription && <TableRow label='Short Description' value={event.shortDescription} />}
            {event.longDescription && <TableRow label='Long Description' value={event.longDescription} />}
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