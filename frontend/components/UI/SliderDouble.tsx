import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { DoubleSlideFilterProps } from '@/assets/interfaces';

function valuetext(value: number) {
  return `${value}`;
}

export function DoubleSliderComponent({
  label,
  filterValues,
  setFilter,
  step,
  min,
  max,
  unit
}: DoubleSlideFilterProps) {

  const handleChange = (event: Event, newValue: number | number[]) => {
    setFilter(newValue as number[]);
  };

  const minValue = filterValues[0];
  const maxValue = filterValues[1];

  const chosenRange = minValue != maxValue ? `Searching for events between ${minValue} and ${maxValue} ${unit}(s).` : `Only with a duration of ${minValue} hour(s).`

  return (
    <div className='filter-component-container'>
      <strong>{label}</strong><br />
      {chosenRange}
      <div className='flex-row slider-container'>
        <Box className='slider-box' sx={{ width: 350 }}
        >
          <Slider
            getAriaLabel={() => 'Temperature range'}
            value={filterValues}
            onChange={handleChange}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            step={step}
            marks
            min={min}
            max={max}
          />
        </Box>
      </div>
    </div>
  );
}