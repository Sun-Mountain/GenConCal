import { Autocomplete, TextField } from '@mui/material';
import { AutocompleteProps } from '@/assets/interfaces';

export function AutoCompleteMultiple({
  groupLabel,
  hiddenList,
  handleFilter,
  labels
}: AutocompleteProps) {
  return (
    <div className='autocomplete-container'>
      <Autocomplete
        multiple
        disableCloseOnSelect
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
