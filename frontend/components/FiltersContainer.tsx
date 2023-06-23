import { FiltersTypes } from "@/assets/interfaces"
import ToggleComponent from "./UI/Toggle"

export default function FiltersContainer ({
  hideSoldOut,
  setHideSoldOut
}: FiltersTypes) {
  return (
    <>
      <ToggleComponent
        switchLabel='Sold Out Events'
        hide={hideSoldOut}
        setHide={setHideSoldOut}
      />
    </>
  )
}