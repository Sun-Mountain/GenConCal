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

const calendarItem = (eventIndex: number) => {
  var { title } = eventData[eventIndex]

  return (
    <div className='calendar-item'>
      {title}
    </div>
  )
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
    var { startDate, startTime } = eventData[fave],
        hr = startTime.substring(0,2);
    timeLabels.map(timeLabel => {
      var timeHr = timeLabel.substring(0,2),
          timeMin = timeLabel.substring(timeLabel.length - 2);
      if (timeHr === hr && timeMin === '00') {
        filteredFaves[startDate][timeLabel].push(fave)
      }
    })
  })
  return filteredFaves;
}

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  if (!faves || !faves.length) {
    return (
      <>
        No faves.
      </>
    )
  }

  const filteredFaves = organizeFilters(faves,
                                        filteredEvents.startTimes,
                                        filteredEvents.startDates);

  const anyFaves = (dayLabel: string, timeLabel: string) => {
    var favesForTimeAndDay = filteredFaves[dayLabel][timeLabel],
        filterNum = favesForTimeAndDay.length;

    if (!filterNum) {
      return '';
    }

    favesForTimeAndDay.map(fave => calendarItem(fave))
  }

  return (
    <>
      Export Page

      <div>
        <table className='export-table'>
          <thead>
            <th className='export-column'>
              <AccessTimeIcon />
            </th>
            {dayLabels.map(day => {
              return (
                <th key={`${day}-column`} className='export-column'>
                  {day}
                </th>
              )
            })}
          </thead>
          <tbody>
            {timeLabels.map(timeLabel => {
              return (
                <tr key={`${timeLabel}-row`}>
                  <td className='export-column'>
                    {timeLabel}
                  </td>
                  {dayLabels.map(dayLabel => {
                    var faveList = filteredFaves[dayLabel][timeLabel]
                    return (
                      <td key={`${timeLabel}-row-${dayLabel}-cell`} className='export-column'>
                        {faveList.length > 0 && (
                          <div className='calendar-items-container'>
                            <div className='items-wrapper'>
                              {faveList.map(fave => {
                                return calendarItem(fave)
                              })}
                            </div>
                          </div>
                        )}
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