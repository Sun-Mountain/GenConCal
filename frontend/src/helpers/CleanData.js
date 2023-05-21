import Events from '@/assets/data/events.json';

const getStartDate = (event) => {
  return event["Start Date & Time"].slice(0,10);
}

const getLocation = (event) => {
  return event["Location"].toUpperCase();
}

const getStartTime = (event) => {
  const ogTime = event["Start Date & Time"].slice(-8);

  var hours = Number(ogTime.match(/^(\d+)/)[1]);
  var minutes = Number(ogTime.match(/:(\d+)/)[1]);
  var AMPM = ogTime.match(/\s(.*)$/)[1];
  if(AMPM == "PM" && hours<12) hours = hours+12;
  if(AMPM == "AM" && hours==12) hours = hours-12;
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;

  const newTime = sHours + ":" + sMinutes;

  return newTime;
}

export default function cleanData () {
  const data = {};

  Events.map(event => {
    event.isVisible = true;

    const startDate = getStartDate(event);
    const location = getLocation(event);
    const startTime = getStartTime(event);

    if (!data[startDate]) {
      data[startDate] = {}
    }

    if (location) {
      if (!data[startDate][location]) {
        data[startDate][location] = {};
      }

      if (!data[startDate][location][startTime]) {
        data[startDate][location][startTime] = []
      }

      data[startDate][location][startTime].push(event);
    }
  })

  return data;
}