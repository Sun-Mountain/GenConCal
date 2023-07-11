import EventData from '@/assets/events/rawEvents.json';
import { KeyProps, EventListingProps, DataProps } from '@/assets/interfaces';

const getFirstKey = (object: any) => {
  const keyList = Object.keys(object)

  return keyList[0]
}

const getKeyByValue = (object: any, value: string) => {
  const foundKey = Object.keys(object).find((key) => object[key] === value);
  return foundKey;
}

const cleanData = ({ keyList, eventList }: {
  keyList: KeyProps;
  eventList: EventListingProps[];
}) => {
  var data: DataProps = {
    eventData: [],
    filteredEvents: {
      ageRequirement: {},
      cost: {},
      duration: {},
      endDates: {},
      endTimes: {},
      eventTypes: {},
      experienceType: {},
      gameSystems: {},
      groups: {},
      locations: {},
      materialsRequired: [],
      noTickets: [],
      startDates: {},
      startTimes: {},
      tournaments: []
    }
  }

  // Event Times
  const startDateTimeKey = getKeyByValue(keyList, "Start Date & Time");
  const endDateTimeKey = getKeyByValue(keyList, "End Date & Time");

  // Event Info
  const ageRequirementKey = getKeyByValue(keyList, "Age Required");
  const contactKey = getKeyByValue(keyList, "Email");
  const costKey = getKeyByValue(keyList, "Cost $");
  const durationKey = getKeyByValue(keyList, "Duration");
  const descriptionShortKey = getKeyByValue(keyList, "Short Description");
  const descriptionLongKey = getKeyByValue(keyList, "Long Description");
  const eventTypeKey = getKeyByValue(keyList, "Event Type");
  const expKey = getKeyByValue(keyList, "Experience Required");
  const gameIdKey = getKeyByValue(keyList, "Game ID");
  const gameSystemKey = getKeyByValue(keyList, "Game System");
  const gmNamesKey = getKeyByValue(keyList, "GM Names");
  const groupKey = getKeyByValue(keyList, "Group");
  const locationKey = getKeyByValue(keyList, "Location");
  const materialsKey = getKeyByValue(keyList, "Materials Required Details");
  const playersMinKey = getKeyByValue(keyList, "Minimum Players");
  const playersMaxKey = getKeyByValue(keyList, "Maximum Players");
  const tableNumKey = getKeyByValue(keyList, "Table Number");
  const ticketCountKey = getKeyByValue(keyList, "Tickets Available");
  const titleKey = getKeyByValue(keyList, "Title");
  const tournamentKey = getKeyByValue(keyList, "Tournament?");
  const roomKey = getKeyByValue(keyList, "Room Name");
  const roundKey = getKeyByValue(keyList, "Round Number");
  const roundTotalKey = getKeyByValue(keyList, "Total Rounds");
  const websiteKey = getKeyByValue(keyList, "Website");

  eventList.map((event, index) => {
  })

  return data;
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

  cleanData({ keyList: labelKey, eventList: rawEventsList });
};