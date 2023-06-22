import {
  AgeRequirementEnum,
  FilterContainerInterface
} from "@/assets/interfaces/FilterInterfaces"
import ToggleButtonsMultiple from "@/components/ui/ToggleButtonGroup"

export default function FiltersContainer ({
  ageFilter,
  setAgeFilter,
  filterByAge,
  xpFilter,
  setXPFilter,
  filterByXP
}: FilterContainerInterface) {
  return (
    <>
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
    </>
  )
}