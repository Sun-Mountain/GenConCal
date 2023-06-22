import {
  AgeRequirementEnum,
  FilterContainerInterface
} from "@/assets/interfaces/FilterInterfaces"
import ToggleButtonsMultiple from "@/components/ui/ToggleButtonGroup"
import SwitchComponent from "../ui/SwitchComponent"

export default function FiltersContainer ({
  ageFilter,
  setAgeFilter,
  filterByAge,
  xpFilter,
  setXPFilter,
  filterByXP,
  soldOut,
  setSoldOut,
  hideMaterials,
  setHideMaterials
}: FilterContainerInterface) {
  return (
    <>
      <div className="flex-wrap">
        <div className="toggle-btn-container">
          <ToggleButtonsMultiple
            btnValues={AgeRequirementEnum}
            filter={filterByAge}
            filterFor={ageFilter}
            setFilterFor={setAgeFilter}
            label={'Age Requirement Filter'}
          />
          <ToggleButtonsMultiple
            btnValues={filterByXP}
            filter={filterByXP}
            filterFor={xpFilter}
            setFilterFor={setXPFilter}
            label={'Experience Filter'}
          />
        </div>
        <div className="switches-container">
          <SwitchComponent
            label={'Sold Out Events'}
            value={soldOut}
            setValue={setSoldOut}
          />
          <SwitchComponent
            label={'Events with Required Materials'}
            value={hideMaterials}
            setValue={setHideMaterials}
          />
        </div>
      </div>
    </>
  )
}