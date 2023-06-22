import {
  AgeRequirementEnum,
  FilterContainerInterface
} from "@/assets/interfaces/FilterInterfaces"
import ToggleButtonsMultiple from "@/components/ui/ToggleButtonGroup"

export default function FiltersContainer ({
  ageFilter,
  setAgeFilter,
  filterByAge,
}: FilterContainerInterface) {
  return (
    <div className=''>
      <ToggleButtonsMultiple
        btnValues={AgeRequirementEnum}
        filter={filterByAge}
        filterFor={ageFilter}
        setFilterFor={setAgeFilter}
      />
    </div>
  )
}