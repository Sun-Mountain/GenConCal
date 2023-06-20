import Switch from '@mui/material/Switch';
import { SwitchInterface } from '@/interfaces/Components';

export default function SwitchComponent({ switchLabel, hide, setHide }: SwitchInterface) {
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