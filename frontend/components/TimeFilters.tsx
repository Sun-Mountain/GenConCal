import { Dispatch, SetStateAction } from "react";
import AutocompleteTimeComponent from "@/components/UI/AutoCompleteTime";
import getQuarterHours from "@/helpers/getQuarterHours";

const times = getQuarterHours();

export default function TimeFilters ({
  earliestStartTime,
  setEarliestStartTime,
  latestStartTime,
  setLatestStartTime
}: {
  earliestStartTime: string;
  setEarliestStartTime: Dispatch<SetStateAction<string>>;
  latestStartTime: string;
  setLatestStartTime: Dispatch<SetStateAction<string>>;
}) {
  return (
    <>
      <strong>Filter By Event Start Time</strong><br /><br />
      <div className='time-range'>
        <AutocompleteTimeComponent
          label='Earliest Start Time'
          options={times}
          defaultValue={times[0]}
          value={earliestStartTime}
          setValue={setEarliestStartTime}
        />
        -
        <AutocompleteTimeComponent
          label='Latest Start Time'
          options={times}
          defaultValue={times[times.length - 1]}
          value={latestStartTime}
          setValue={setLatestStartTime}
        />
      </div>
    </>
  )
}