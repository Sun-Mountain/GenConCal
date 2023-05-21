import Events from '@/assets/data/events.json';

const getStartDate = (event) => {
  return event["Start Date & Time"].slice(0,10);
}

const getLocation = (event) => {
  return event["Location"].toUpperCase();
}

const getStartTime = (event) => {
  return event["Start Date & Time"].slice(-8);
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