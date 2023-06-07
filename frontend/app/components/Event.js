import { isNotInArray } from "@/helpers/cleanData";

function Event ({
  system,
  timeEnd,
  timeStart,
  title,
  handleChoice
}) {

  const date = `${timeStart.toDateString()}`
  const startTime = `${timeStart.toLocaleTimeString()}`;
  const endTime = `${timeEnd.toLocaleTimeString()}`;

  return (
    <div
      className="event-container"
      onClick={handleChoice}
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