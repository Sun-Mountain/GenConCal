import { useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import FiltersContainer from "@/components/FiltersContainer";

import { filterCategories } from './_app';

export default function Home () {
  const [hideSoldOut, setHideSoldOut] = useState(false);

  console.log(filterCategories);

  return (
    <>
      <FiltersContainer
        hideSoldOut={hideSoldOut}
        setHideSoldOut={setHideSoldOut}
      />
      <DailyTabs
        hideSoldOut={hideSoldOut}
      />
    </>
  )
}
