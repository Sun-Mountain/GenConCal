function TimeContainer({time, events}) {
  console.log(events)
  return (
    <>
      <h4>{time}</h4>
      {events.map(event => {
        return (
          <div>
            {event.title}
          </div>
        )
      })}
    </>
  )
}

export default TimeContainer;