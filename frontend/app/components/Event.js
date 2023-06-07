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
  type,
  selectEvent
}) {
  const startTime = timeStart;
  const endTime = timeEnd;

  return (
    <div
      className="event-container"
      onClick={() => selectEvent(gameId)}
    >
      <h4>
        {title}
      </h4>
      <div>
        {system}
      </div>
      <div>
        {startTime} - {endTime}
      </div>
    </div>
  )
}

export default Event;