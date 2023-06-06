// import Image from 'next/image'
// import styles from './page.module.css'
'use client';
import { useState } from 'react';
import CheckboxComponent from '@/components/CheckboxComponent';

import DateContainer from '@/components/DateContainer';
import cleanData from '@/helpers/CleanData';

export default function Home() {
  const { data, eventList } = cleanData();
  const dateList = data.dates.sort();

  const [dates, setDates] = useState(
    dateList.map(date => ({ isChecked: false, value: date }))
  )

  return (
    <div class="flex-row">
      <div class="search-params-cont">
        <h2>Dates</h2>
        {dates.map(date => {
          return <CheckboxComponent
                    checked={date.isChecked}
                    key={date.value}
                    set={setDates}
                    value={date.value}
                  />
        })}
      </div>
      <div>
        {dates.map(date => {
          if (date.checked) {
            return <DateContainer
                      date={date.value}
                      dateData={eventList[date.value]}
                      key={`${date.value}-container`}
                    />
          }
        })}
      </div>
    </div>
  )
}
