import Events from '@/assets/events.json';

const isNotInArray = (array, item) => {
  return !array.includes(item)
}

export default function cleanData () {
  const data = {
    ageReqs: [],
    costs: [],
    dates: [],
    duration: [],
    events: [],
    experience: [],
    groups: [],
    locations: [],
    types: [],
  }

  Events.map(event => {
    const newEvent = {};

    const eventAgeReq = event["Age Required"];
    const eventGroup = event["Group"].trim();

    // Age Requirements
    if (eventAgeReq && isNotInArray(data.ageReqs, eventAgeReq)) {
      data.ageReqs.push(eventAgeReq);
    }

    newEvent.ageReq = eventAgeReq;

    // Groups
    if (eventGroup && isNotInArray(data.groups, eventGroup)) {
      data.groups.push(eventGroup);
    }

    newEvent.group = eventGroup;

    data.events.push(newEvent);
  })

  data.groups.sort();

  return data;
};