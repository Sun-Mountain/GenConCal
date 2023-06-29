import { useEffect } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { eventData, filteredEvents } from "@/pages/_app";
import getQuarterHours from "@/helpers/getQuarterHours";
import { UniqueFilter } from '@/assets/interfaces';

const timeLabels = getQuarterHours();

const dayLabels = Object.keys(filteredEvents.startDates).sort();
const times = Object.keys(filteredEvents.startTimes).sort();

interface TimeFilterProps {
  [index: string]: number[];
}

interface FilteredFavesProps {
  [index: string]: TimeFilterProps;
}


const organizeFilters = (
  faves: number[],
  timeFilter: UniqueFilter,
  dayFilter: UniqueFilter
) => {
  var filteredFaves: FilteredFavesProps = {}
  dayLabels.map(dayLabel => {
    filteredFaves[dayLabel] = {}
    timeLabels.map(timeLabel => {
      filteredFaves[dayLabel][timeLabel] = [];
    })
  })

  faves.map(fave => {
    var { startDate, startTime } = eventData[fave];
    filteredFaves[startDate][startTime].push(fave)
  })
  console.log(filteredFaves)
}

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  useEffect(() => {
    if (faves.length) {
      organizeFilters(faves,
                      filteredEvents.startTimes,
                      filteredEvents.startDates,
                      )
    }
  }, [faves])

  if (!faves || !faves.length) {
    return (
      <>
        No faves.
      </>
    )
  }

  return (
    <>
      Export Page

      <div>
        <table>
          <thead>
            <th>
              <AccessTimeIcon />
            </th>
            {dayLabels.map(day => {
              return (
                <th key={`${day}-column`}>
                  {day}
                </th>
              )
            })}
          </thead>
          <tbody>
            {timeLabels.map(timeLabel => {
              // var favesFilteredByTime = favesByTime(timeLabel)
              return (
                <tr key={`${timeLabel}-row`}>
                  <td>
                    {timeLabel}
                  </td>
                  {dayLabels.map(dayLabel => {
                    return (
                      <td key={`${timeLabel}-row-${dayLabel}-cell`}>

                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}