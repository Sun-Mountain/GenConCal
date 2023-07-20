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
