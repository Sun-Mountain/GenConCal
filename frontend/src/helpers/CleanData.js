import Events from '@/assets/data/events.json';

const notInArray = (array, item) => {
  return !array.includes(item);
}

const getTime = (time) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;

  return `${sHours}:${sMinutes}`
}

export default function cleanData () {
  const data = {
    age: [],
    costs: [],
    dates: [],
    duration: [],
    experience: [],
    groups: [],
    locations: [],
    maxPlayers: [],
    systems: [],
    types: [],
  }
  const eventList = {}

  Events.map(event => {
    var newEvent = {}
    const group = event.Group;
    const type = event["Event Type"];
    const system = event["Game System"];
    const maxPlayers = Number(event["Maximum Players"]);
    const ageReq = event["Age Required"];
    const exp = event["Experience Required"];
    const materials = event["Materials Required"] === "Yes" ? true : false;
    const start = new Date(event["Start Date & Time"]);
    const startDate = start.toLocaleDateString();
    const startTime = getTime(start);
    const end = new Date(event["End Date & Time"]);
    const duration = Number(event.Duration);
    const tournament = event["Tournament?"] === "Yes" ? true : false;
    const cost = Number(event["Cost $"]);
    const location = event["Location"].toUpperCase();

    newEvent.id = event["Game ID"];

    if (group) {
      if (notInArray(data.groups, group)) {
        data.groups.push(group)
      }
      newEvent.group = group;
    }

    newEvent.title = event.Title.trim();

    if (type) {
      if (notInArray(data.types, type)) {
        data.types.push(type)
      }
      newEvent.type = type;
    }

    if (system) {
      if (notInArray(data.systems, system)) {
        data.systems.push(system)
      }
      newEvent.system = system;
    }

    if (maxPlayers) {
      if (notInArray(data.maxPlayers, maxPlayers)) {
        data.maxPlayers.push(maxPlayers);
      }
      newEvent.maxPlayers = maxPlayers;
    }

    if (ageReq) {
      if (notInArray(data.age, ageReq)) {
        data.age.push(ageReq)
      }
      newEvent.ageReq = ageReq;
    }

    if (exp) {
      if (notInArray(data.experience, exp)) {
        data.experience.push(exp)
      }
      newEvent.experience = exp;
    }

    newEvent.materials = materials;
    newEvent.start = start;

    if (!eventList[startDate]) {
      eventList[startDate] = {}
    }

    if(notInArray(data.dates, startDate)) {
      data.dates.push(startDate)
    }

    newEvent.end = end;

    if (notInArray(data.duration, duration)) {
      data.duration.push(duration);
    }

    newEvent.duration = duration;
    newEvent.tournament = tournament;

    if (cost) {
      if (notInArray(data.costs, cost)) {
        data.costs.push(cost)
      }
      newEvent.cost = cost;
    }

    if (location) {
      if (notInArray(data.locations, location)){
        data.locations.push(location);
      }
      if (!eventList[startDate][location]) {
        eventList[startDate][location] = {}
      }

      if(!eventList[startDate][location][startTime]){
        eventList[startDate][location][startTime] = []
      }

      eventList[startDate][location][startTime].push(newEvent);
    }
  })

  data.age.sort();
  data.costs.sort(function(a, b) {
    return a - b;
  });
  data.duration.sort(function(a, b) {
    return a - b;
  });
  data.experience.sort();
  data.groups.sort();
  data.locations.sort();
  data.maxPlayers.sort(function(a, b) {
    return a - b;
  });
  data.systems.sort();
  data.types.sort();

  return { data, eventList };
}

// const getDate = (event, type) => {
//   return event[`${type} Date & Time`].slice(0,10);
// }

// const getLocation = (event) => {
//   return event["Location"].toUpperCase();
// }

// const getTime = (event, type) => {
//   const ogTime = event[`${type} Date & Time`].slice(-8);

//   var hours = Number(ogTime.match(/^(\d+)/)[1]);
//   var minutes = Number(ogTime.match(/:(\d+)/)[1]);
//   var AMPM = ogTime.match(/\s(.*)$/)[1];
//   if(AMPM == "PM" && hours<12) hours = hours+12;
//   if(AMPM == "AM" && hours==12) hours = hours-12;
//   var sHours = hours.toString();
//   var sMinutes = minutes.toString();
//   if(hours<10) sHours = "0" + sHours;
//   if(minutes<10) sMinutes = "0" + sMinutes;

//   const newTime = sHours + ":" + sMinutes;

//   return newTime;
// }

// export default function cleanData () {
//   const data = {};

//   Events.map(event => {
//     event.isVisible = true;

//     const startDate = getDate(event, 'Start');
//     const location = getLocation(event);
//     const startTime = getTime(event, 'Start');
//     event.Duration = Number(event.Duration)

//     if (!data[startDate]) {
//       data[startDate] = {}
//     }

//     if (location) {
//       if (!data[startDate][location]) {
//         data[startDate][location] = {};
//       }

//       if (!data[startDate][location][startTime]) {
//         data[startDate][location][startTime] = []
//       }

//       data[startDate][location][startTime].push(event);
//     }
//   })

//   return data;
// }