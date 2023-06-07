'use client';
import { useRef, useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import cleanData from '@/helpers/cleanData';
import DayContainer from './components/DayContainer';

// const DayContainer = dynamic(() => import('./components/DayContainer'));

export default function Home() {
  const data = cleanData();

  const [dates, setDates] = useState(Object.keys(data.events).sort());
  const [hiddenDates, setHiddenDates] = useState([]);

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
          const hidden = hiddenDates.includes(date) ? 'hidden-date' : '';
          return <button key={index} className={`btn date-btn ${hidden}`} onClick={() => hideDate(date)} >{date}</button>
        })}
      </div>
      <ul id="schedules-container">
        {dates.map(date => {
          return (
            <>
              {!hiddenDates.includes(date) &&
                <DayContainer 
                  key={date}
                  date={date}
                  events={data.events[date]}
                />}
            </>
          )
        })}
      </ul>
    </main>
  )
}
