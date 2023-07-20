import EventData from '@/assets/events/events.json';
import { getFirstKey } from '@/helpers';
import { cleanData } from './cleanData';

export const parseData = () => {
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

export const parseDate = (dateString: string) => {
  const year = dateString.substring(0,4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(8, 10);
  const minute = dateString.substring(10, 12);
  const second = dateString.substring(12, 14);

  return `${month}/${day}/${year} ${hour}:${minute}:${second}`
}