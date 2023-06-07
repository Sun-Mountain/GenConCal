'use client';
import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import cleanData from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
// import DayContainer from './components/DayContainer';

const DayContainer = dynamic(() => import('./components/DayContainer'));

export default function Home() {
  const data = cleanData();
  const dates = Object.keys(data.events).sort();
  const rawTimes = data.times;

  const [hiddenDates, setHiddenDates] = useState([]);
  const [startTime, setStartTime] = useState(rawTimes[0])
  const [endTime, setEndTime] = useState(rawTimes[rawTimes.length - 1])

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

  return (
    <main>
      <div className='button-container'>
        {dates.map((date, index) => {
          const show = hiddenDates.includes(date) ? 'hidden' : 'visible';
          return (<button
                    key={index}
                    className={`btn ${show}`}
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
                              }}
                            >
                              {rawTimes.map(time => {
                                return (<option key={time} value={time}>{time}</option>)
                              })}
                            </select>
      </div>
      <div>
        Select End Time: <select
                              value={endTime}
                              onChange={(e) => {
                                setEndTime(e.target.value);
                              }}
                            >
                              {rawTimes.map(time => {
                                return (<option key={time} value={time}>{time}</option>)
                              })}
                            </select>
      </div>
      <ul id="schedules-container">
        {dates.map(date => {
          var showDate = hiddenDates.includes(date);
          return (
            <>
              { !showDate &&
                <DayContainer 
                  key={date}
                  events={data.events[date]}
                  date={date}
                  dayStart={startTime}
                  dayEnd={endTime}
                  timesList={rawTimes}
                />
              }
            </>
          )
        })}
      </ul>
    </main>
  )
}
