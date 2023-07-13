import React, { Fragment, useMemo } from 'react'
import PropTypes from 'prop-types'

import * as dates from 'date-arithmetic'
import { Calendar, Views, Navigate, DateLocalizer, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { eventData, filteredEvents } from "@/pages/_app";
import getQuarterHours from "@/helpers/getQuarterHours";
import { UniqueFilter } from '@/assets/interfaces';

const timeLabels = getQuarterHours();

const dayLabels = Object.keys(filteredEvents.startDates).sort();
const times = Object.keys(filteredEvents.startTimes).sort();

interface TimeFilterProps {
  [index: string]: number[];
}

interface FilteredFavesProps {
  [index: string]: TimeFilterProps;
}

const calendarItem = (eventIndex: number) => {
  var { title } = eventData[eventIndex]

  return (
    <div className='calendar-item'>
      {title}
    </div>
  )
}

interface CalItem {
  title: string;
  start: Date;
  end: Date;
}

const organizeFilters = (
  faves: number[],
  timeFilter: UniqueFilter,
  dayFilter: UniqueFilter
) => {
  var filteredFaves: FilteredFavesProps = {}
  dayLabels.map(dayLabel => {
    filteredFaves[dayLabel] = {}
    timeLabels.map(timeLabel => {
      filteredFaves[dayLabel][timeLabel] = [];
    })
  })

  faves.map(fave => {
    var { startDate, startTime } = eventData[fave],
        hr = startTime.substring(0,2);
    timeLabels.map(timeLabel => {
      var timeHr = timeLabel.substring(0,2),
          timeMin = timeLabel.substring(timeLabel.length - 2);
      if (timeHr === hr && timeMin === '00') {
        filteredFaves[startDate][timeLabel].push(fave)
      }
    })
  })
  return filteredFaves;
}

const eventList = (faves: number[]) => {
  var faveList: object[] = [];

  faves.map(fave => {
    var { title, startDate, startTime, endDate, endTime } = eventData[fave],
          startDateTime = new Date (`${startDate} ${startTime}`),
          endDateTime = new Date (`${endDate} ${endTime}`),
          faveInfo = { title: title, start: startDateTime, end: endDateTime};
    faveList.push(faveInfo);
  })

  return faveList;
}

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  if (!faves || !faves.length) {
    return (
      <>
        No faves.
      </>
    )
  }

  const localizer = momentLocalizer(moment)

  const filteredFaves = organizeFilters(faves,
                                        filteredEvents.startTimes,
                                        filteredEvents.startDates);

  const myEventsList = eventList(faves);

  console.log(myEventsList)

  return (
    <>
      Export Page

      <div>
        <table className='export-table'>
          <thead>
            <th className='export-column'>
              <AccessTimeIcon />
            </th>
            {dayLabels.map(day => {
              return (
                <th key={`${day}-column`} className='export-column'>
                  {day}
                </th>
              )
            })}
          </thead>
          <tbody>
            {timeLabels.map(timeLabel => {
              return (
                <tr key={`${timeLabel}-row`}>
                  <td className='export-column'>
                    {timeLabel}
                  </td>
                  {dayLabels.map(dayLabel => {
                    var faveList = filteredFaves[dayLabel][timeLabel]
                    return (
                      <td key={`${timeLabel}-row-${dayLabel}-cell`} className='export-column'>
                        {faveList.length > 0 && (
                          <div className='calendar-items-container'>
                            <div className='items-r'>
                              {faveList.map(fave => {
                                return calendarItem(fave)
                              })}
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>

        <div className="myCustomHeight">
          <Calendar
            localizer={localizer}
            events={myEventsList as CalItem[]}
            startAccessor="start"
            endAccessor="end"
          />
        </div>
      </div>
    </>
  )
}