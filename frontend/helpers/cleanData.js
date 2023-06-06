import Events from '@/assets/events.json';

export const isNotInArray = (array, item) => {
  return !array.includes(item)
}

export default function cleanData () {
  const data = {
    ageReqs: [],
    costs: [],
    dates: [],
    events: [],
    experience: [],
    groups: [],
    locations: [],
    systems: [],
    tickets: [],
    types: [],
  }

  Events.map(event => {
    const newEvent = {};

    const eventAgeReq = event["Age Required"];
    const eventCost = Number(event["Cost $"]);
    const eventExp = event["Experience Required"];
    const eventGroup = event["Group"].trim();
    const eventLocation = event["Location"].toLowerCase();
    const eventSystem = event["Game System"].trim();
    const eventTickets = Number(event["Tickets Available"]);
    const eventTimeStart = new Date(event["Start Date & Time"]);
    const eventTimeEnd = new Date(event["End Date & Time"]);
    const eventType = event["Event Type"].trim();

    // Age Requirements
    if (eventAgeReq && isNotInArray(data.ageReqs, eventAgeReq)) {
      data.ageReqs.push(eventAgeReq);
    }

    newEvent.ageReq = eventAgeReq;

    // Cost
    if (isNotInArray(data.costs, eventCost)) {
      data.costs.push(eventCost);
    }

    newEvent.cost = eventCost;

    // Date and Time
    if (eventTimeStart && isNotInArray(data.dates, eventTimeStart)) {
      data.dates.push(eventTimeStart);
    }

    if (eventTimeEnd && isNotInArray(data.dates, eventTimeEnd)) {
      data.dates.push(eventTimeEnd);
    };

    newEvent.timeStart = eventTimeStart;
    newEvent.timeEnd = eventTimeEnd;

    // Experience
    if (eventExp && isNotInArray(data.experience, eventExp)) {
      data.experience.push(eventExp);
    };

    newEvent.experience = eventExp;

    // Groups
    if (eventGroup && isNotInArray(data.groups, eventGroup)) {
      data.groups.push(eventGroup);
    };

    newEvent.group = eventGroup;

    // Id
    newEvent.gameId = event["Game ID"];

    // Location
    if (eventLocation && isNotInArray(data.locations, eventLocation)) {
      data.locations.push(eventLocation);
    };

    newEvent.location = eventLocation;

    // Materials
    newEvent.materialsReq = event["Materials Required"] === "Yes";

    // System
    if (eventSystem && isNotInArray(data.systems, eventSystem)) {
      data.systems.push(eventSystem)
    };

    newEvent.system = eventSystem;

    // Tickets
    if (eventTickets && isNotInArray(data.tickets, eventTickets)) {
      data.tickets.push(eventTickets)
    };

    newEvent.tickets = eventTickets;

    // Title
    newEvent.title = event["Title"].trim();

    // Tournament
    newEvent.tournament = event["Tournament?"] === "Yes";

    // Types
    if (eventType && isNotInArray(data.types, eventType)) {
      data.types.push(eventType);
    };

    newEvent.type = eventType;

    data.events.push(newEvent);
  })

  data.costs.sort(function(a,b){ return b - a; }).reverse();
  data.dates.sort(function(a,b){ return b - a; }).reverse();
  data.events.sort(function(a,b){ return b.timeStart - a.timeStart; }).reverse();
  data.groups.sort();
  data.locations.sort();
  data.systems.sort();
  data.tickets.sort(function(a,b){ return b - a; }).reverse();
  data.types.sort();

  return data;
};