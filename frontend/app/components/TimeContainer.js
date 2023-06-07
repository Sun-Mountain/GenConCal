import { useState } from 'react';
import { isNotInArray } from '@/helpers/cleanData';
import dynamic from 'next/dynamic';
import Event from './Event';

function TimeContainer ({
  time,
  events
}) {
  if (events) {
    return (
      <div>
        <span className="time-title">
          {time}
        </span>
      </div>
    )
  }
}

export default TimeContainer;