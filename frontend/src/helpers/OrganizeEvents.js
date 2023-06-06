export default function organizeEvents (events) {
  const eventList = {};

  events.map(event => {
    const startDate = event.start.toDateString()

    if(!eventList[startDate]) {
      eventList[startDate] = {}
    }
  })
}