import { ChangeEvent } from 'react';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { RadioGroupProps } from '@/assets/interfaces';

export function RadioButtonsGroup({
  value,
  label,
  setValue,
  options
}: RadioGroupProps) {

  const clearChoices = () => {
    setValue('')
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>, value: string) => {
    setValue(value as '' | 'hide' | 'show');
  };

  return (
    <FormControl>
      <strong>{label}</strong>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        value={value}
        onChange={handleChange}
        name="radio-buttons-group"
      >
        {options.map((option, index) => {
          return <FormControlLabel
                    key={index}
                    value={option.value}
                    control={<Radio />}
                    label={option.choiceLabel}
                  />
        })}
      </RadioGroup>
      <Button onClick={clearChoices}>
        Clear {label}
      </Button>
    </FormControl>
  );
}