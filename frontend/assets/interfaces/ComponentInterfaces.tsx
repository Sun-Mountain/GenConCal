import { Dispatch, SetStateAction } from "react";
import { UniqueFilter, UniqueStrings } from "@/assets/interfaces/FilterInterfaces";

export interface RadioGroupInterface {
  label: string;
  options: string[];
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
}

export interface SwitchComponentInterface {
  label: string;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}

export interface ToggleButtonGroupInterface {
  btnValues: UniqueStrings | UniqueFilter;
  filter: UniqueFilter;
  filterFor: number[];
  setFilterFor: Dispatch<SetStateAction<number[]>>;
  label: string;
}