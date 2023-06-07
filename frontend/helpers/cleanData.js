import Events from '@/assets/events.json';

const getTime = (time) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;
  return `${sHours}:${sMinutes}`
}

export const isNotInArray = (array, item) => {
  return !array.includes(item)
}

export default function cleanData () {
  const data = {
    ageReqs: [],
    costs: [],
    events: {},
    experience: [],
    groups: [],
    locations: [],
    systems: [],
    tickets: [],
    times: [],
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
    const startTime = getTime(eventTimeStart);

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

    // Dates & Times

    if (startTime && isNotInArray(data.times, startTime)) {
      data.times.push(startTime);
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

    if (!data.events[eventTimeStart.toLocaleDateString()]) {
      data.events[eventTimeStart.toLocaleDateString()] = {};
    }

    if (!data.events[eventTimeStart.toLocaleDateString()][startTime]) {
      data.events[eventTimeStart.toLocaleDateString()][startTime] = []
    }

    data.events[eventTimeStart.toLocaleDateString()][startTime].push(newEvent);
  })

  data.costs.sort(function(a,b){ return b - a; }).reverse();
  data.groups.sort();
  data.locations.sort();
  data.systems.sort();
  data.tickets.sort(function(a,b){ return b - a; }).reverse();
  data.times.sort();
  data.types.sort();

  return data;
};