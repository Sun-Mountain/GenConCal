import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Loading ({ message }: { message: string }) {
  return (
    <div className='loading-container'>
      <Box className='loading-box' sx={{ display: 'flex' }}>
        <h1>
          {message}
        </h1>
        <CircularProgress />
      </Box>
    </div>
  )
}