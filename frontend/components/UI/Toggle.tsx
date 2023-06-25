import Switch from '@mui/material/Switch';
import { ToggleType } from '@/assets/interfaces';

export default function ToggleComponent ({ switchLabel, hide, setHide }: ToggleType) {
  const aria = { inputProps: { 'aria-label': `${switchLabel} Switch` } };
  const label = hide ? `Show ${switchLabel}` : `Hide ${switchLabel}`;

  const handleChange = () => {
    setHide(!hide);
  }

  return (
    <div className='switch-container'>
      <div>
        <strong>{label}</strong>
        <Switch checked={hide} onChange={handleChange} {...aria} />
      </div>
    </div>
  );
}