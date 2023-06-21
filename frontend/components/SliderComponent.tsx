import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { SlideFilter } from '@/interfaces/Filters';

function valuetext(value: number) {
  return `${value}`;
}

export default function SliderComponent({
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
    <Box sx={{ width: 300 }}>
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
  );
}