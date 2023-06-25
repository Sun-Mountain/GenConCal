import { FiltersTypes } from "@/assets/interfaces";
import FilterDrawerContent from "./FilterDrawerContent";
import DrawerComponent from "./UI/Drawer";
import ToggleComponent from "./UI/Toggle";

const FilterDrawer = () => (
  <DrawerComponent>
    <div id='filter-drawer-content-wrapper'>
      <FilterDrawerContent />
    </div>
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