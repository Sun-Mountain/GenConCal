import Button from '@mui/material/Button';
import { ToggleType } from '@/assets/interfaces';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function ToggleComponent ({ switchLabel, hide, setHide }: ToggleType) {
  const aria = { inputProps: { 'aria-label': `${switchLabel} Switch` } };
  const label = hide ? `Show ${switchLabel}` : `Hide ${switchLabel}`;

  const handleChange = () => {
    setHide(!hide);
  }

  return (
    <>
      <Button
        className='toggle-btn'
        onClick={handleChange}
        variant={hide ? 'outlined' : 'contained'}
        startIcon={hide ? <VisibilityIcon /> : <VisibilityOffIcon />}
        {...aria}
      >
        {label}
      </Button>
    </>
  );
}