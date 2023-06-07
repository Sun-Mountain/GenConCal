import { isNotInArray } from "./cleanData";

export default function handleChoice ({
  action,
  choices,
  setChoices,
  dailyTimes,
  setDailyTimes,
  selectedEvent
}) {
  if (action === 'addChoice') {
    var newChoices = choices;
    if (isNotInArray(choices, selectedEvent)) {
      newChoices.push(selectedEvent)

      setDailyTimes(dailyTimes.filter(time => {
        if (!(time >= selectedEvent.timeStart && time < selectedEvent.timeEnd)) {
          return time;
        }
      }));
    }
    setChoices([...newChoices])
  }

  if (action === 'removeChoice') {
    var newChoices = choices,
        index = newChoices.indexOf(selectedEvent);
    if (index > -1) {
      newChoices.splice(index, 1);
    }
    setChoices([...newChoices])
  }
}