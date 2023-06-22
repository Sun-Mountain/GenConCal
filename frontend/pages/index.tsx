import { useState } from "react";

import FiltersContainer from "@/components/containers/FiltersContainer";

import { filterTypes } from "@/pages/_app";

export default function Home () {
  console.log(filterTypes)
  // Lists
  const filterByAge = filterTypes.ageRequirement;
  const filterByXP = filterTypes.experienceType;

  // Button Filters
  const [ageFilter, setAgeFilter] = useState<number[]>([])
  const [xpFilter, setXPFilter] = useState<number[]>([])

  return (
    <>
      <FiltersContainer
        ageFilter={ageFilter}
        setAgeFilter={setAgeFilter}
        filterByAge={filterByAge}
        xpFilter={xpFilter}
        setXPFilter={setXPFilter}
        filterByXP={filterByXP}
      />
    </>
  )
}
