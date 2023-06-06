import { isNotInArray } from "@/helpers/cleanData";

function Event ({
  ageReq,
  cost,
  experience,
  gameId,
  group,
  system,
  timeEnd,
  timeStart,
  title,
  type,
  choices,
  setChoices
}) {

  const date = `${timeStart.toDateString()}`
  const startTime = `${timeStart.toLocaleTimeString()}`;
  const endTime = `${timeEnd.toLocaleTimeString()}`;

  const handleChoices = () => {
    if (isNotInArray(choices, gameId)) {
      var newChoices = choices;
      newChoices.push(gameId);
      setChoices(newChoices);
    } else {
      var index = choices.indexOf(gameId),
          newChoices = choices;
      newChoices.splice(index, 1)
      setChoices(newChoices)
    }

    console.log(choices);
  }

  return (
    <div
      className="event-container"
      onClick={handleChoices}
    >
      <h4>
        {title}
      </h4>
      <div>
        {system}
      </div>
      <div>
        {date}
      </div>
      <div>
        {startTime} - {endTime}
      </div>
    </div>
  )
}

export default Event;