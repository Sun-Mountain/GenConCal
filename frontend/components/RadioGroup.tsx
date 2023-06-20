import { ChangeEvent } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import { RadioGroupInterface } from '@/interfaces/Components';

export default function RadioButtonsGroup({
  formLabel,
  options,
  setValue,
  value
}: RadioGroupInterface) {

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <div className='radio-group-container'>
      <FormControl>
        <strong id="radio-buttons-group-tournament-label">{formLabel}</strong>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={value}
          onChange={handleChange}
          name="radio-buttons-group"
        >
          {options.map(option => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  );
}
