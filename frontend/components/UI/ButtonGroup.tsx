
import { useState } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonGroupProps } from '@/assets/interfaces';

export default function ButtonGroup({
  eventList,
  filteredEvents,
  setFilteredEvents,
  groupLabel,
  hiddenList,
  setHiddenList,
  labels,
}: ButtonGroupProps) {

  const addEventsToFilter = (eventIds: number[]) => {
    var newFilters = [...filteredEvents, ...eventIds];
    setFilteredEvents(newFilters);
  }

  const removeEventsFromFilter = (eventIds: number[]) => {
    var newFilters = filteredEvents.filter(val => !eventIds.includes(val));
    setFilteredEvents(newFilters);
  }

  const addLabel = (label: string) => {
    var newHidden = hiddenList;
    newHidden.push(label);
    setHiddenList([...newHidden]);
  }

  const removeLabel = (label: string) => {
    var index = hiddenList.indexOf(label),
        newHidden = hiddenList;
    newHidden.splice(index, 1);
    setHiddenList([...newHidden])
  }

  const handleFilter = (label: string) => {
    if (!hiddenList.includes(label)) {
      addLabel(label);
      addEventsToFilter(eventList[label]);
    } else {
      removeLabel(label);
      removeEventsFromFilter(eventList[label]);
    }
  }


  return (
    <div className='filter-component-container'>
      <strong>
        {groupLabel}
      </strong>
      <div className='btn-container'>
        {labels.map((label: string) => {
          const visible = !hiddenList.includes(label);
          return (
            <div key={label}>
              <Button
                onClick={() => handleFilter(label)}
                className={`${visible ? 'visible' : 'hidden'} toggle-btn`}
                startIcon={visible ? <CheckIcon /> : <CloseIcon />}
              >
                {label}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  );
}