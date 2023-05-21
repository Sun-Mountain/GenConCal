// import Image from 'next/image'
// import styles from './page.module.css'
'use client';
import { useState } from 'react'
import CheckboxComponent from '@/components/CheckboxComponent';
import cleanData from '@/helpers/CleanData';

export default function Home() {
  // const [currentState, setCurrentState] = useState('Unchecked')
  const data = cleanData();
  const dates = Object.keys(data).sort();

  return (
    <div>
      {/* <div>Current State Is: {currentState}</div>
      <CheckboxComponent setCurrentState={setCurrentState} /> */}
      <div id="date-container">
        {dates.map(date => {
          const locations = Object.keys(data[date]).sort();

          return (
            <div className='date-column'>
              <h2>{date}</h2>
              <div className="location-container">
                {locations.map(location => {
                  const times = Object.keys(data[date][location]).sort();

                  return (
                    <div className='location-column'>
                      <h3>{location}</h3>
                      {times.map(time => {
                        const events = data[date][location][time];
                        return (
                          <div>
                            <h4>
                              {time}
                            </h4>
                            {events.map(event => {
                              return (
                                <div>
                                  {event.Title}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
