import * as React from 'react';
import Switch from '@mui/material/Switch';
import { SwitchComponentInterface } from '@/assets/interfaces/ComponentInterfaces';


export default function SwitchComponent({
  label,
  value,
  setValue
}: SwitchComponentInterface) {
  const ariaLabel = { inputProps: { 'aria-label': `${label} Switch` } };
  const switchLabel = value ? `Show ${label}` : `Hide ${label}`;

  const handleChange = () => {
    setValue(!value);
  }

  return (
    <div className='filter-container'>
      <div className='filter-label'>
        {switchLabel}
      </div>
      <Switch checked={value} onChange={handleChange} {...ariaLabel} />
    </div>
  );
}