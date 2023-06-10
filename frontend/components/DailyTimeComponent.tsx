interface TimeComponent {
  events: number[],
  time: string
}

export default function DailyTimeComponent ({
  events,
  time
}: TimeComponent) {
  return (
    <div>
      <span className="time-title">
        {time}
      </span>
      <div className="event-list">
        {events.map((event: number, index: number) => (
          <div key={index}>
            {event}
          </div>
        ))}
      </div>
    </div>
  )
}