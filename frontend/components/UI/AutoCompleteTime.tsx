import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import getQuarterHours from '@/helpers/getQuarterHours';

const times = getQuarterHours();

export default function AutocompleteTimeComponent() {
  const [value, setValue] = React.useState<string | null>(times[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event: any, newValue: string | null) => {
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id="controllable-states-demo"
        options={times}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Controllable" />}
      />
    </>
  );
}