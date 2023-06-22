import { useState } from "react";

import FiltersContainer from "@/components/containers/FiltersContainer";

import { filterTypes } from "@/pages/_app";

export default function Home () {
  console.log(filterTypes)
  // Lists
  const filterByAge = filterTypes.ageRequirement;

  // Button Filters
  const [ageFilter, setAgeFilter] = useState<number[]>([])

  console.log(ageFilter);

  return (
    <>
      <FiltersContainer
        ageFilter={ageFilter}
        setAgeFilter={setAgeFilter}
        filterByAge={filterByAge}
      />
    </>
  )
}
