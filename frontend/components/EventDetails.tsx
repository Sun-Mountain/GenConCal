import findEvent from "@/helpers/findEvent"
import TableRow from "./UI/TableRow"

export default function EventDetails ({ eventIndex }: { eventIndex: number }) {
  const event = findEvent(eventIndex)

  const startDateTime = `${event.startDate}, ${event.startTime}`
  const endDateTime = `${event.endDate}, ${event.endTime}`
  const durationSuffix = event.duration > 1 ? 'hrs' : 'hr'
  const cost = `$${event.cost}`
  const isTournament = event.tournament ? 'Yes' : 'No';
  const ticketRatio = `${event.ticketsAvailable} / ${event.playersMax}`

  return (
    <table>
      <tbody className='event-details-table'>
        <TableRow category={'Title'} detail={event.title} />
        <TableRow category={'Game Id'} detail={event.gameId} />
        <TableRow category={'Event Type'} detail={event.eventType} />
        <TableRow category={'Start Date and Time'} detail={startDateTime} />
        <TableRow category={'End Date and Time'} detail={endDateTime} />
        <TableRow category={'Duration'} detail={`${event.duration} ${durationSuffix}`} />
        {event.descriptionShort && (
          <TableRow category={'Short Description'} detail={event.descriptionShort} />
        )}
        {event.descriptionLong && (
          <TableRow category={'Long Description'} detail={event.descriptionLong} />
        )}
        <TableRow category={'Cost'} detail={cost} />
        <TableRow category={'Age Requirement'} detail={event.ageRequirement} />
        <TableRow category={'Experience Requirement'} detail={event.experienceType} />
        {event.materials ? (
          <TableRow category={'Materials Required'} detail={event.materials} />
        ) : (
          <TableRow category={'Materials Required'} detail={'None'} />
        )}
        {event.group && (
          <TableRow category={'Group'} detail={event.group} />
        )}
        {event.location && (
          <TableRow category={'Location'} detail={event.location} />
        )}
        <TableRow category={'Tournament'} detail={isTournament} />
        <TableRow category={'Tickets Available'} detail={ticketRatio} />
      </tbody>
    </table>
  )
}