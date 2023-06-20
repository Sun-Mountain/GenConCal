import { Dispatch, SetStateAction, useState } from 'react';

import { UniqueFilter } from '@/interfaces/Filters';

export default function FilterButtons({
  filter,
  filterFor,
  setFilterFor,
  groupLabel
}: {
  filter: UniqueFilter,
  filterFor: Array<number>,
  setFilterFor: Dispatch<SetStateAction<number[]>>,
  groupLabel: string
}) {
  const labels = Object.keys(filter);

  const [hiddenLabels, setHiddenLabels] = useState<string[]>([]);

  const addEventsToFilter = (eventIds: number[]) => {
    var newFilters = [...filterFor, ...eventIds];
    setFilterFor(newFilters);
  }

  const removeEventsFromFilter = (eventIds: number[]) => {
    var newFilters = filterFor.filter(val => !eventIds.includes(val));
    setFilterFor(newFilters);
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
      addEventsToFilter(filter[label]);
    } else {
      removeLabel(label);
      removeEventsFromFilter(filter[label]);
    }
  }

  return (
    <div className='filter-component-container'>
      <strong>
        {groupLabel}
      </strong>
      <div className='btn-container'>
        {labels.map((label: string) => {
          const showLabel = !hiddenLabels.includes(label) ? 'visible' : 'hidden';
          return (
            <button
              key={label}
              className={`btn ${showLabel}`}
              onClick={() => handleFilter(label)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  );
}
