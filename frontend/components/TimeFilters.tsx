import AutocompleteTimeComponent from "@/components/UI/AutoCompleteTime";
import getQuarterHours from "@/helpers/getQuarterHours";

import { TimeFilterProps } from "@/assets/interfaces";
import DoubleSliderComponent from "./UI/SliderDouble";

const times = getQuarterHours();

export default function TimeFilters ({
  earliestStartTime,
  setEarliestStartTime,
  latestStartTime,
  setLatestStartTime,
  durationFilter,
  setDurationFilter
}: TimeFilterProps) {
  return (
    <div className="filter-content time-drawer">
      <div className="content-group">
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
      </div>
      <div className="content-group">
        <DoubleSliderComponent
          label='Filter by Duration'
          filterValues={durationFilter}
          setFilter={setDurationFilter}
          step={0.5}
          min={0.5}
          max={10}
          unit='hour'
        />
      </div>
    </div>
  )
}