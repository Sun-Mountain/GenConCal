import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { AutocompleteProps } from '@/assets/interfaces';

export default function AutocompleteComponent({
  groupLabel,
  hiddenList,
  handleFilter,
  labels
}: AutocompleteProps) {
  return (
    <div className='autocomplete-container'>
      <Autocomplete
        multiple
        id={`${groupLabel} search list`}
        sx={{ width: 300 }}
        options={labels}
        getOptionLabel={(option) => option}
        value={hiddenList || []}
        onChange={(event, value) => handleFilter({groupLabel, labelList: value})}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            label={groupLabel}
          />
        )}
      />
    </div>
  );
}
