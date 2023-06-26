import { FilterDrawerProps } from "@/assets/interfaces";

import { filteredEvents } from "@/pages/_app";

import ButtonGroup from "@/components/UI/ButtonGroup";

const ageLabels = [ 'kids only (12 and under)',
                    'Everyone (6+)',
                    'Teen (13+)',
                    'Mature (18+)',
                    '21+' ]

export default function FilterDrawerContent ({
  ageReqList,
  setAgeReqList,
  filterAgeReq,
  setFilterAgeReq,
  xpReqList,
  setXPReqList,
  filterXPReq,
  setFilterXPReq,
}: FilterDrawerProps) {

  return (
    <>
      <ButtonGroup
        eventList={filteredEvents.ageRequirement}
        filteredEvents={filterAgeReq}
        setFilteredEvents={setFilterAgeReq}
        groupLabel="Age Requirement"
        hiddenList={ageReqList}
        setHiddenList={setAgeReqList}
        labels={ageLabels}
      />
      <ButtonGroup
        eventList={filteredEvents.experienceType}
        filteredEvents={filterXPReq}
        setFilteredEvents={setFilterXPReq}
        groupLabel="Experience Requirement"
        hiddenList={xpReqList}
        setHiddenList={setXPReqList}
        labels={Object.keys(filteredEvents.experienceType)}
      />
    </>
  )
}