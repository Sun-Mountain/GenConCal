import { Dispatch, SetStateAction } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { FilterAutoList } from '@/interfaces/Filters';

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
      className='filter-list'
      multiple
      id="tags-outlined"
      disableCloseOnSelect
      sx={{ width: 300 }}
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
      renderOption={(props, option) => {
        return (
          <li {...props} key={option}>
            {option}
          </li>
        );
      }}
    />
  );
}
