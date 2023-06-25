import { FiltersTypes } from "@/assets/interfaces"
import DrawerComponent from "./UI/Drawer";
import ToggleComponent from "./UI/Toggle";

const FilterDrawer = () => (
  <DrawerComponent>
    Filters
  </DrawerComponent>
)

export default function FiltersContainer({
    hideSoldOut,
    setHideSoldOut
  }: FiltersTypes) {
  return (
    <div id='filters-container'>
      <ToggleComponent
        switchLabel='Sold Out Events'
        hide={hideSoldOut}
        setHide={setHideSoldOut}
      />
      <FilterDrawer />
    </div>
  );
}