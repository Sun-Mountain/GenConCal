import { Dispatch, SetStateAction, useState } from 'react';

import { UniqueFilter } from '@/helpers/getData';

export default function FilterButtons({
  filter,
  groupLabel,
  filterEvents,
  setFilterEvents
}: {
  filter: UniqueFilter,
  filterEvents: Array<number>,
  setFilterEvents: Dispatch<SetStateAction<number[]>>,
  groupLabel: string
}) {
  const labels = Object.keys(filter);

  const [hiddenLabels, setHiddenLabels] = useState<string[]>([])

  const handleFilter = (label: string) => {
    if (!hiddenLabels.includes(label)) {
      var newHidden = hiddenLabels;
      newHidden.push(label);
      setHiddenLabels([...newHidden]);
    } else {
      var index = hiddenLabels.indexOf(label),
          newHidden = hiddenLabels;
      newHidden.splice(index, 1);
      setHiddenLabels([...newHidden])
    }
  }

  return (
    <div>
      {groupLabel}<br />
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
