import { useState } from "react";

import FiltersContainer from "@/components/containers/FiltersContainer";

import { filterTypes } from "@/pages/_app";

export default function Home () {
  console.log(filterTypes)

  return (
    <>
      <FiltersContainer />
    </>
  )
}
