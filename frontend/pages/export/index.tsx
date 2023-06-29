import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { eventData, filteredEvents } from "@/pages/_app";
import getQuarterHours from "@/helpers/getQuarterHours";

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  if (!faves || !faves.length) {
    return (
      <>
        No faves.
      </>
    )
  }

  const dayLabels = Object.keys(filteredEvents.startDates).sort();
  const timeLabels = Object.keys(filteredEvents.startTimes).sort();
  const times = getQuarterHours;



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