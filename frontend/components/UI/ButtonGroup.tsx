
import { useState } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonGroupProps } from '@/assets/interfaces';

export default function ButtonGroup({
  filteredEvents,
  setFilteredEvents,
  groupLabel,
  list,
}: ButtonGroupProps) {
  const labels = Object.keys(list);

  const [hiddenLabels, setHiddenLabels] = useState<string[]>([]);

  const addEventsToFilter = (eventIds: number[]) => {
    var newFilters = [...filteredEvents, ...eventIds];
    setFilteredEvents(newFilters);
  }

  const removeEventsFromFilter = (eventIds: number[]) => {
    var newFilters = filteredEvents.filter(val => !eventIds.includes(val));
    setFilteredEvents(newFilters);
  }

  const addLabel = (label: string) => {
    var newHidden = hiddenLabels;
    newHidden.push(label);
    setHiddenLabels([...newHidden]);
  }

  const removeLabel = (label: string) => {
    var index = hiddenLabels.indexOf(label),
        newHidden = hiddenLabels;
    newHidden.splice(index, 1);
    setHiddenLabels([...newHidden])
  }

  const handleFilter = (label: string) => {
    if (!hiddenLabels.includes(label)) {
      addLabel(label);
      addEventsToFilter(list[label]);
    } else {
      removeLabel(label);
      removeEventsFromFilter(list[label]);
    }
  }


  return (
    <div className='filter-component-container'>
      <strong>
        {groupLabel}
      </strong>
      <div className='btn-container'>
        {labels.map((label: string) => {
          const visible = !hiddenLabels.includes(label);
          return (
            <div key={label}>
              <Button
                onClick={() => handleFilter(label)}
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