import { useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import FiltersContainer from "@/components/FiltersContainer";

import { filterTypes } from './_app';

export default function Home () {
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<number[]>([]);

  const handleFilter = (filterType: string, value: string[]) => {
    console.log({filterType, value})

    switch(filterType) {
      case 'eventType':
        value.map(val => {
          var filterValues = filterTypes.eventTypes[val],
              filterForEvents = [...filterValues];
          setEventTypeFilter(filterForEvents)
        })
        
        // setEventTypeFilter([...value]);
        break;
      default:
        console.log('error');
        break;
    }
  }

  return (
    <>
      <FiltersContainer
        hideSoldOut={hideSoldOut}
        setHideSoldOut={setHideSoldOut}
        handleFilter={handleFilter}
      />
      <DailyTabs
        hideSoldOut={hideSoldOut}
        filterFor={[...eventTypeFilter]}
      />
    </>
  )
}
