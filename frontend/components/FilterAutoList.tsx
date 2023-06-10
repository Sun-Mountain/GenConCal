import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { UniqueFilter } from '@/helpers/getData';

interface FilterAutoList {
  filter: UniqueFilter,
  setFilterFor: Dispatch<SetStateAction<number[]>>,
  label: string
}

export default function FilterAutoList({
  filter,
  setFilterFor,
  label
}: FilterAutoList) {
  const options = Object.keys(filter).sort();

  const handleFilters = (value: string[]) => {
    var newFilters: number[] = [];
    value.map(value => {
      var filterValues = filter[value];
      newFilters = [...newFilters, ...filterValues];
    })
    setFilterFor(newFilters)
  }

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={options}
      getOptionLabel={(option) => option}
      onChange={(event, value) => handleFilters(value)}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={`Filter For ${label}`}
        />
      )}
    />
  );
}
