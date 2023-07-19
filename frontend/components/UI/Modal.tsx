import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Box, Modal } from '@mui/material';

const style = {
  width: {
    xs: 350, // theme.breakpoints.up('xs')
    sm: 600, // theme.breakpoints.up('sm')
    md: 600, // theme.breakpoints.up('md')
    lg: 800, // theme.breakpoints.up('lg')
    xl: 800, // theme.breakpoints.up('xl')
  },
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: 7/8,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  overflow: 'scroll',
};

export function ModalComponent({
  open,
  setOpen,
  children
}: {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  children: ReactNode
}) {
  const handleClose = () => setOpen(false);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {children}
        </Box>
      </Modal>
    </>
  );
}