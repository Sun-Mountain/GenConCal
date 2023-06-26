import { ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { RadioGroupProps } from '@/assets/interfaces';

export default function RadioButtonsGroup({
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