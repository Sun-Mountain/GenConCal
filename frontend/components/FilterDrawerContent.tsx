import { FilterDrawerProps } from "@/assets/interfaces";

import { filteredEvents } from "@/pages/_app";

import ButtonGroup from "@/components/UI/ButtonGroup";

const ageLabels = [ 'kids only (12 and under)',
                    'Everyone (6+)',
                    'Teen (13+)',
                    'Mature (18+)',
                    '21+' ]
const xpLabels = Object.keys(filteredEvents.experienceType)

export default function FilterDrawerContent ({
  handleFilter,
  ageReqList,
  xpReqList,
}: FilterDrawerProps) {

  return (
    <>
      <ButtonGroup
        groupLabel="Age Requirement"
        hiddenList={ageReqList}
        handleFilter={handleFilter}
        labels={ageLabels}
      />
      <ButtonGroup
        groupLabel="Experience Requirement"
        hiddenList={xpReqList}
        handleFilter={handleFilter}
        labels={xpLabels}
      />
    </>
  )
}