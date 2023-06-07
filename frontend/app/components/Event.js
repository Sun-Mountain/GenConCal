import { isNotInArray } from "@/helpers/cleanData";

function Event ({
  cost,
  experience,
  gameId,
  group,
  system,
  timeEnd,
  timeStart,
  title,
  type
}) {
  const date = `${timeStart.toDateString()}`
  const startTime = `${timeStart.toLocaleTimeString()}`;
  const endTime = `${timeEnd.toLocaleTimeString()}`;

  return (
    <div
      className="event-container"
      onClick={() => handleChoice(gameId)}
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