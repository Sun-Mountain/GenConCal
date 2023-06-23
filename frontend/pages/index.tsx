import { useState } from 'react';
import DailyTabs from '@/components/DailyTabs';
import FiltersContainer from "@/components/FiltersContainer";

export default function Home () {
  const [hideSoldOut, setHideSoldOut] = useState(false)

  return (
    <>
      <FiltersContainer
        hideSoldOut={hideSoldOut}
        setHideSoldOut={setHideSoldOut}
      />
      <DailyTabs />
    </>
  )
}
