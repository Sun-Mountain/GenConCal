import { FilterDrawerProps } from "@/assets/interfaces";

import { filteredEvents } from "@/pages/_app";

import ButtonGroup from "@/components/UI/ButtonGroup";

export default function FilterDrawerContent ({
  filterAgeReq,
  setFilterAgeReq
}: FilterDrawerProps) {

  return (
    <>
      <ButtonGroup
        filteredEvents={filterAgeReq}
        setFilteredEvents={setFilterAgeReq}
        groupLabel="Age Requirement"
        list={filteredEvents.ageRequirement}
      />
    </>
  )
}