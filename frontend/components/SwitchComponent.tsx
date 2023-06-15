import { Dispatch, SetStateAction } from 'react';
import Switch from '@mui/material/Switch';

interface Switch {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export default function SwitchComponent({ switchLabel, hide, setHide }: Switch) {
  const aria = { inputProps: { 'aria-label': `${switchLabel} Switch` } };
  const label = hide ? `Show ${switchLabel}` : `Hide ${switchLabel}`;

  const handleChange = () => {
    setHide(!hide);
  }

  return (
    <div className='switch-container'>
      <div>
        <strong>{label}</strong> <Switch checked={hide} onChange={handleChange}{...aria} />
      </div>
    </div>
  );
}