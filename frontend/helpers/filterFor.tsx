import { UniqueFilter } from "@/assets/interfaces";
import { Dispatch, SetStateAction } from "react";

const filterForHelper = (
  eventList: UniqueFilter,
  setFilter: Dispatch<SetStateAction<number[]>>,
  labelList: string[],
  setLabelList: Dispatch<SetStateAction<string[]>>,
) => {
  setLabelList(labelList);
  var newFilters: number[] = [];
  labelList.map(value => {
    var filterValues = eventList[value];
    newFilters = [...newFilters, ...filterValues];
  })
  setFilter(newFilters)
}

export default filterForHelper;