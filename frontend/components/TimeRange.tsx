import { Dispatch, SetStateAction, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { UniqueFilter } from '@/helpers/getData';

export default function TimeRange({
  timesAndEvents,
  setFilteredEvents,
  setTimeFilter,
  setTimeLabels
}: {
  timesAndEvents: UniqueFilter,
  setFilteredEvents: Dispatch<SetStateAction<number[]>>,
  setTimeFilter: Dispatch<SetStateAction<UniqueFilter>>,
  setTimeLabels: Dispatch<SetStateAction<string[]>>
}) {
  var quarterHours = ["00", "15", "30", "45"];
  var times = [];
  for(var i = 0; i < 24; i++){
    for(var j = 0; j < 4; j++){
      var time = i + ":" + quarterHours[j];
      if(i < 10){
        time = "0" + time;
      }
      times.push(time);
    }
  }

  const defaultStart = '00:00';
  const defaultEnd = '23:45';

  const [startTime, setStartTime] = useState<string | null>(defaultStart);
  const [startInput, setStartInput] = useState(defaultStart);
  const [endTime, setEndTime] = useState<string | null>(defaultEnd);
  const [endInput, setEndInput] = useState(defaultEnd);

  const filterEvents = (eventList: UniqueFilter) => {
    var newFiltered: number [] = [];
    Object.keys(eventList).forEach(key => {
      newFiltered = [...newFiltered, ...eventList[key]];
    })
    setFilteredEvents(newFiltered);
  }


  const handleStartTime = (newStart: string) => {
    var newTimesAndEvents = timesAndEvents;
    Object.keys(newTimesAndEvents).forEach(key => {
      var afterStart = key >= newStart,
          ending = endTime ? endTime : defaultEnd,
          beforeEnd = key < ending;
      if (!afterStart || !beforeEnd) {
        delete newTimesAndEvents[key];
      }
    })
    filterEvents(newTimesAndEvents);
    setTimeFilter(newTimesAndEvents);
    setTimeLabels(Object.keys(newTimesAndEvents).sort());
  }

  const handleEndTime = (newEnd: string) => {
    var newTimesAndEvents = timesAndEvents;
    Object.keys(newTimesAndEvents).forEach(key => {
      var afterEnd = key > newEnd,
          starting = startTime ? startTime : defaultStart,
          beforeStart = key < starting;
      if (afterEnd || beforeStart) {
        delete newTimesAndEvents[key];
      }
    })
    filterEvents(newTimesAndEvents);
    setTimeFilter(newTimesAndEvents);
    setTimeLabels(Object.keys(newTimesAndEvents).sort());
  }

  return (
    <div className='flex-row'>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={times}
        sx={{ width: 300 }}
        onChange={(event: any, newValue: string | null) => {
          var newStart = newValue ? newValue : defaultStart;
          setStartTime(newStart);
          handleStartTime(newStart);
        }}
        inputValue={startInput}
        onInputChange={(event, newInputValue) => {
          var newStart = newInputValue ? newInputValue : defaultStart;
          setStartInput(newStart);
        }}
        defaultValue={defaultStart}
        renderInput={(params) => <TextField {...params} label="Earliest Start Time" />}
      />
      <div className='time-divider'>
        -
      </div>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={times}
        sx={{ width: 300 }}
        defaultValue={defaultEnd}
        onChange={(event: any, newValue: string | null) => {
          var newEnd = newValue ? newValue : defaultStart;
          setEndTime(newEnd);
          handleEndTime(newEnd);
        }}
        inputValue={endInput}
        onInputChange={(event, newInputValue) => {
          var newEnd = newInputValue ? newInputValue : defaultStart;
          setEndInput(newEnd);
        }}
        renderInput={(params) => <TextField {...params} label="Latest Start Time" />}
      />
    </div>
  );
}
