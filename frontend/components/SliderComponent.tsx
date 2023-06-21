import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { SlideFilter } from '@/interfaces/Filters';

function valuetext(value: number) {
  return `${value}`;
}

export default function SliderComponent({
  label,
  filterValues,
  setFilter,
  step,
  min,
  max
}: SlideFilter) {

  const handleChange = (event: Event, newValue: number | number[]) => {
    setFilter(newValue as number[]);
  };

  return (
    <>
      <strong>{label}</strong>
      <div className='flex-row slider-container'>
        <div className='slider-end-label'>
          {min} Hour
        </div>
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
        <div className='slider-end-label'>
          {max} Hours
        </div>
      </div>
    </>
  );
}