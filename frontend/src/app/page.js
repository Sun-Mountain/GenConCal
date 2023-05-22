// import Image from 'next/image'
// import styles from './page.module.css'
'use client';
import { useState } from 'react';
import CheckboxComponent from '@/components/CheckboxComponent';

import DateContainer from '@/components/DateContainer';
import cleanData from '@/helpers/CleanData';

export default function Home() {
  const [currentState, setCurrentState] = useState('Unchecked')
  const data = cleanData();
  const dates = Object.keys(data).sort();

  return (
    <div>
      <div>Current State Is: {currentState}</div>
      <CheckboxComponent setCurrentState={setCurrentState} />
      {dates.map(date => {
        return <DateContainer id={`${date}-container`} key={date} date={date} dateData={data[date]} />
      })}
    </div>
  )
}
