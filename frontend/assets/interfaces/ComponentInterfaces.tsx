import { Dispatch, SetStateAction } from "react";
import { UniqueFilter, UniqueStrings } from "@/assets/interfaces/FilterInterfaces";

export interface ToggleButtonGroupInterface {
  btnValues: UniqueStrings;
  filter: UniqueFilter;
  filterFor: number[];
  setFilterFor: Dispatch<SetStateAction<number[]>>;
}