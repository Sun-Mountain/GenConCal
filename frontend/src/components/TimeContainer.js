function TimeContainer({time, events}) {
  return (
    <>
      <h4>{time}</h4>
      {events.map(event => {
        return (
          <div>
            {event.Title}
          </div>
        )
      })}
    </>
  )
}

export default TimeContainer;