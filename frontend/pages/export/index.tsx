import { filteredEvents } from "@/pages/_app";

const eventsListByDay = filteredEvents.startDates;
const eventsListByStartTime = filteredEvents.startTimes;
const dayLabels = Object.keys(eventsListByDay).sort();
const timeLabels = Object.keys(eventsListByStartTime).sort();

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  const getFaves = (day: string) => {
    const dayFaves = eventsListByDay[day]
    var favesForDay = dayFaves;

    favesForDay = favesForDay.filter(val => faves.includes(val));

    return favesForDay;
  }

  return (
    <>
      Export
      <div className='schedule-container'>
        {dayLabels.map((day, index) => {
          var favesPerDay = getFaves(day);

          if (favesPerDay.length) {
            return (
              <ul className='schedule-list-day' key={index}>
                <li>
                  <strong>
                    {day}
                  </strong>
                  <div className='schedule-container'>
                    {timeLabels.map((time, index) => {
                      const favesPerTime = favesPerDay.filter(val => eventsListByStartTime[time].includes(val));

                      if (favesPerTime.length) {
                        return (
                          <ul className='schedule-list-time' key={index}>
                            <li>
                              {time}
                            </li>
                          </ul>
                        )
                      }
                    })}
                  </div>
                </li>
              </ul>
            )
          }

        })}
      </div>
    </>
  )
}