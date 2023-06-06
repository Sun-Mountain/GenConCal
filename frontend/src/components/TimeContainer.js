function TimeContainer({time, events}) {
  return (
    <>
      <h4>{time}</h4>
      {events.map(event => {
        return (
          <div>
            {event.Title}
            <div>
              {event.Duration}
            </div>
          </div>
        )
      })}
    </>
  )
}

export default TimeContainer;