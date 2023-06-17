import { Dispatch, SetStateAction } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { TimeRangeComponent } from '@/interfaces/Components';

export default function TimeRange({
  earlyStartTime = '00:00',
  lateStartTime = '23:45',
  setEarlyStartTime,
  setLateStartTime
}: TimeRangeComponent) {
  var quarterHours = ["00", "15", "30", "45"];
  var times: string[] = [];
  for(var i = 0; i < 24; i++){
    for(var j = 0; j < 4; j++){
      var time = i + ":" + quarterHours[j];
      if(i < 10){
        time = "0" + time;
      }
      times.push(time);
    }
  }

  return (
    <div className='time-range-container'>
      <div className='time-range-label'>
        <strong>Start Time Range</strong>: {earlyStartTime} - {lateStartTime}
      </div>
      <div className='flex-row'>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={times}
          sx={{ width: 145 }}
          onChange={(event: any, newValue: string | null) => {
            var newTime = newValue ? newValue : earlyStartTime;
            setEarlyStartTime(newTime);
          }}
          inputValue={earlyStartTime}
          onInputChange={(event, newInputValue) => {
            var newTime = newInputValue ? newInputValue : earlyStartTime;
            setEarlyStartTime(newTime);
          }}
          defaultValue={earlyStartTime}
          renderInput={(params) => <TextField {...params} label="Earliest Start Time" />}
        />
        <div className='time-divider'> - </div>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={times}
          sx={{ width: 145 }}
          onChange={(event: any, newValue: string | null) => {
            var newTime = newValue ? newValue : lateStartTime;
            setLateStartTime(newTime);
          }}
          inputValue={lateStartTime}
          onInputChange={(event, newInputValue) => {
            var newTime = newInputValue ? newInputValue : lateStartTime;
            setLateStartTime(newTime);
          }}
          defaultValue={lateStartTime}
          renderInput={(params) => <TextField {...params} label="Latest Start Time" />}
        />
      </div>
    </div>
  );
}