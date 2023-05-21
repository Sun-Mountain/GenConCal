// import Image from 'next/image'
// import styles from './page.module.css'
'use client';
import { useState } from 'react'
import CheckboxComponent from '@/components/CheckBoxComponent';
import cleanData from '@/helpers/CleanData';

export default function Home() {
  const [currentState, setCurrentState] = useState('Unchecked')
  const data = cleanData();
  console.log(data);
  return (
    <div>
      <div>Current State Is: {currentState}</div>
      <CheckboxComponent setCurrentState={setCurrentState} />
    </div>
  )
}
