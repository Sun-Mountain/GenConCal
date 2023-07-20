import { TimeFilterProps } from "@/assets/interfaces";
import { AutoCompleteTime, DoubleSliderComponent } from "@/components";
import { getQuarterHours } from "@/helpers";

const times = getQuarterHours();

export function TimeFilters ({
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
          <AutoCompleteTime
            label='Earliest Start Time'
            options={times}
            defaultValue={times[0]}
            value={earliestStartTime}
            setValue={setEarliestStartTime}
          />
          -
          <AutoCompleteTime
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