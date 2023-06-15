import { Dispatch, SetStateAction } from 'react';
import Switch from '@mui/material/Switch';

interface Switch {
  switchLabel: string;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
}

export default function SwitchComponent({ switchLabel, hide, setHide }: Switch) {
  const aria = { inputProps: { 'aria-label': `${switchLabel} Switch` } };

  const handleChange = () => {
    setHide(!hide);
  }

  return (
    <div className='switch-container'>
      Show {switchLabel} <Switch checked={hide} onChange={handleChange}{...aria} /> Hide {switchLabel}
    </div>
  );
}