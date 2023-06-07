'use client';
import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import cleanData from '@/helpers/cleanData';
import DayContainer from './components/DayContainer';

export default function Home() {
  const data = cleanData();
  const dates = Object.keys(data.events).sort();
  const rawTimes = data.times;

  const [hiddenDates, setHiddenDates] = useState([]);
  const [timesList, setTimesList] = useState(rawTimes);
  const [startTime, setStartTime] = useState(timesList[0])
  const [endTime, setEndTime] = useState(timesList[timesList.length - 1])

  const hideDate = (date) => {
    if (isNotInArray(hiddenDates, date)) {
      var newHidden = hiddenDates;
      newHidden.push(date);
      setHiddenDates([...newHidden]);
    } else {
      var index = hiddenDates.indexOf(date),
          newHidden = hiddenDates;
      newHidden.splice(index, 1);
      setHiddenDates([...newHidden])
    }
  }

  const filterTimeRange = (startTime, endTime) => {
    var endIndex = rawTimes.indexOf(endTime),
        startIndex = rawTimes.indexOf(startTime),
        newTimes = rawTimes.slice(startIndex, endIndex + 1);
    setTimesList(newTimes);
  }

  return (
    <main>
      <div className='button-container'>
        {dates.map((date, index) => {
          const hidden = hiddenDates.includes(date) ? 'hidden-date' : '';
          return (<button
                    key={index}
                    className={`btn date-btn ${hidden}`}
                    onClick={() => hideDate(date)}
                  >
                    {date}
                  </button>)
        })}
      </div>
      <div>
        Select Start Time: <select
                              value={startTime}
                              onChange={(e) => {
                                setStartTime(e.target.value);
                                filterTimeRange(e.target.value, endTime);
                              }}
                            >
                              {rawTimes.map(time => {
                                return (<option value={time}>{time}</option>)
                              })}
                            </select>
      </div>
      <div>
        Select End Time: <select
                              value={endTime}
                              onChange={(e) => {
                                setEndTime(e.target.value);
                                filterTimeRange(startTime, e.target.value);
                              }}
                            >
                              {rawTimes.map(time => {
                                return (<option value={time}>{time}</option>)
                              })}
                            </select>
      </div>
      <ul id="schedules-container">
        {dates.map(date => {
          var showDate = hiddenDates.includes(date) || hiddenDates.length === 0;
          return (
            <>
              { showDate &&
                <DayContainer 
                  key={date}
                  events={data.events[date]}
                  date={date}
                  timesList={timesList}
                />
              }
            </>
          )
        })}
      </ul>
    </main>
  )
}
