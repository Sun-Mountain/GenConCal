import EventData from '@/assets/events/events.json';
import { cleanData } from './cleanData';

const getFirstKey = (object: any) => {
  const keyList = Object.keys(object)

  return keyList[0]
}

export default function parseData () {
  const rawData = EventData as any;

  // Values of first Key
  const firstKey = getFirstKey(rawData)
  const jsonString = JSON.stringify(rawData[firstKey]);
  const rawJsonValues = JSON.parse(jsonString);

  // Get labels
  const keyRow = getFirstKey(rawJsonValues)
  const labelKey = rawJsonValues[keyRow]
  labelKey.freeze

  // Remove label level
  delete rawJsonValues[keyRow];

  // Events list
  const rawEventsList = rawJsonValues;

  const cleanedData = cleanData({ keyList: labelKey, eventList: rawEventsList });

  return cleanedData
};
