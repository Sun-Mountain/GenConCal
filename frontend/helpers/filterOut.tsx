import { Dispatch, SetStateAction } from "react";
import { filteredEvents } from "@/pages/_app";
import { UniqueFilter } from "@/assets/interfaces";

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

const filterOutHelper = (
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

export default filterOutHelper;