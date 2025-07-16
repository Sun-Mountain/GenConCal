import { UniqueFilter } from "@/assets/interfaces";
import { Dispatch, SetStateAction } from "react";

export const filterForHelper = (
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

const addEventsToFilter = (
  eventIds: number[],
  filterList: number[],
  setFilterList: Dispatch<SetStateAction<number[]>>
) => {
  var newFilters = [...filterList, ...eventIds];
  setFilterList(newFilters);
}

const removeEventsFromFilter = (
  eventIds: number[],
  filterList: number[],
  setFilterList: Dispatch<SetStateAction<number[]>>
) => {
  var newFilters = filterList.filter(val => !eventIds.includes(val));
  setFilterList(newFilters);
}

const addLabel = (label: string,
  hiddenLabeList: string[],
  setHiddenLabelList: Dispatch<SetStateAction<string[]>>
) => {
  var newHidden = hiddenLabeList;
  newHidden.push(label);
  setHiddenLabelList([...newHidden]);
}

const removeLabel = (
  label: string,
  hiddenLabeList: string[],
  setHiddenLabelList: Dispatch<SetStateAction<string[]>>
) => {
  var index = hiddenLabeList.indexOf(label),
      newHidden = hiddenLabeList;
  newHidden.splice(index, 1);
  setHiddenLabelList([...newHidden])
}

export const filterOutHelper = (
  eventList: UniqueFilter,
  filter: number[],
  setFilter: Dispatch<SetStateAction<number[]>>,
  label: string,
  labelList: string[],
  setLabelList: Dispatch<SetStateAction<string[]>>,
) => {
  if (!labelList.includes(label)) {
    addLabel(label, labelList, setLabelList);
    addEventsToFilter(eventList[label], filter, setFilter);
  } else {
    removeLabel(label, labelList, setLabelList);
    removeEventsFromFilter(eventList[label], filter, setFilter);
  }
}