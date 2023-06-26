import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { AutocompleteProps } from '@/assets/interfaces';

export default function AutocompleteComponent({
  componentLabel,
  hiddenList,
  handleFilter,
  labels
}: AutocompleteProps) {
  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={labels}
      getOptionLabel={(option) => option}
      defaultValue={hiddenList || []}
      onChange={(event, value) => handleFilter({ groupLabel: componentLabel, labelArray: value})}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField
          {...params}
          label={componentLabel}
          placeholder={componentLabel}
        />
      )}
    />
  );
}
