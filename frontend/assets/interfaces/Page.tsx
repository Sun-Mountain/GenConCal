import { Dispatch, SetStateAction } from "react";

export interface HomePageProps {
  faves: number[];
  setFaves: Dispatch<SetStateAction<number[]>>;
}