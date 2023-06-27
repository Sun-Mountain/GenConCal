import { UniqueFilter } from "@/assets/interfaces";
import { Dispatch, SetStateAction } from "react";
// import { filteredEvents } from "@/pages/_app";
// import { UniqueFilter } from "@/assets/interfaces";

// const addEventsToFilter = (
//   eventIds: number[],
//   filterList: number[],
//   setFilterList: Dispatch<SetStateAction<number[]>>
// ) => {
//   var newFilters = [...filterList, ...eventIds];
//   setFilterList(newFilters);
// }

// const removeEventsFromFilter = (
//   eventIds: number[],
//   filterList: number[],
//   setFilterList: Dispatch<SetStateAction<number[]>>
// ) => {
//   var newFilters = filterList.filter(val => !eventIds.includes(val));
//   setFilterList(newFilters);
// }

// const addLabel = (label: string,
//   hiddenLabeList: string[],
//   setHiddenLabelList: Dispatch<SetStateAction<string[]>>
// ) => {
//   var newHidden = hiddenLabeList;
//   newHidden.push(label);
//   setHiddenLabelList([...newHidden]);
// }

// const removeLabel = (
//   label: string,
//   hiddenLabeList: string[],
//   setHiddenLabelList: Dispatch<SetStateAction<string[]>>
// ) => {
//   var index = hiddenLabeList.indexOf(label),
//       newHidden = hiddenLabeList;
//   newHidden.splice(index, 1);
//   setHiddenLabelList([...newHidden])
// }

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