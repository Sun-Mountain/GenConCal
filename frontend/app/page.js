'use client';
import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import cleanData from '@/helpers/cleanData';
import DayContainer from './components/DayContainer';

export default function Home() {
  const data = cleanData();
  const rawTimes = data.times;

  const [dates, setDates] = useState(Object.keys(data.events).sort());
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

  const filterStartTime = (newStartTime) => {
    setStartTime(newStartTime);
    var indexOfElement = rawTimes.indexOf(newStartTime),
        newTimes = rawTimes.slice(indexOfElement);
    setTimesList(newTimes);
  }

  const filterEndTime = (newEndTime) => {
    setEndTime(newEndTime);
    var indexOfElement = rawTimes.indexOf(newEndTime),
        newTimes = rawTimes.slice(0, indexOfElement + 1);
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
                                filterStartTime(e.target.value);
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
                                filterEndTime(e.target.value);
                              }}
                            >
                              {rawTimes.map(time => {
                                return (<option value={time}>{time}</option>)
                              })}
                            </select>
      </div>
      <ul id="schedules-container">
        {dates.map(date => {
          return (
            <>
              {!hiddenDates.includes(date) &&
                <DayContainer 
                  key={date}
                  events={data.events[date]}
                  date={date}
                  timesList={timesList}
                />}
            </>
          )
        })}
      </ul>
    </main>
  )
}
