'use client';
import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import cleanData from '@/helpers/cleanData';
import DayContainer from './components/DayContainer';

export default function Home() {
  const data = cleanData();
  const ageReqs = data.ageReqs;
  const dates = Object.keys(data.events).sort();
  const rawTimes = data.times;

  const [hiddenDates, setHiddenDates] = useState([]);
  const [hiddenReqs, setHiddenReqs] = useState([]);
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

  const hideReq = (req) => {
    if (isNotInArray(hiddenReqs, req)) {
      var newHidden = hiddenReqs;
      newHidden.push(req);
      setHiddenReqs([...newHidden]);
    } else {
      var index = hiddenReqs.indexOf(req),
          newHidden = hiddenReqs;
      newHidden.splice(index, 1);
      setHiddenReqs([...newHidden])
    }

    console.log(hiddenReqs)
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
      <div className='button-container'>
        {ageReqs.map((req, index) => {
          const hidden = hiddenReqs.includes(req) ? 'hidden-req' : '';
          return (<button
                    key={index}
                    className={`btn req-btn ${hidden}`}
                    onClick={() => hideReq(req)}
                  >
                    {req}
                  </button>)
        })}
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
                  hiddenReqs={hiddenReqs}
                  timesList={timesList}
                />}
            </>
          )
        })}
      </ul>
    </main>
  )
}
