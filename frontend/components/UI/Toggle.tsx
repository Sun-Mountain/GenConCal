import { Button } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ToggleType } from '@/assets/interfaces';

export function ToggleComponent ({ switchLabel, hide, setHide }: ToggleType) {
  const aria = { inputprops: { 'aria-label': `${switchLabel} Switch` } };
  const label = hide ? `Show ${switchLabel}` : `Hide ${switchLabel}`;

  const handleChange = () => {
    setHide(!hide);
  }

  return (
    <Button
      className='toggle-btn'
      onClick={handleChange}
      variant={hide ? 'outlined' : 'contained'}
      startIcon={hide ? <Visibility /> : <VisibilityOff />}
      {...aria}
    >
      {label}
    </Button>
  );
}