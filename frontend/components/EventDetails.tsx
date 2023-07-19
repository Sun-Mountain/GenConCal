import { Button } from "@mui/material";
import { ConfirmationNumber } from '@mui/icons-material';
import { TableRow } from "@/components"
import findEvent from "@/helpers/findEvent"

export function EventDetails ({ eventIndex }: { eventIndex: number }) {
  const {
    ageRequirement,
    cost,
    descriptionLong,
    descriptionShort,
    duration,
    endDate,
    endTime,
    eventType,
    experienceType,
    gameId,
    gameSystem,
    group,
    materials,
    playersMax,
    startDate,
    startTime,
    ticketsAvailable,
    title,
    tournament
  } = findEvent(eventIndex);
  const eventLinkId = gameId.substring(7);
  const startDateTime = `${startDate}, ${startTime}`
  const endDateTime = `${endDate}, ${endTime}`
  const durationSuffix = duration > 1 ? 'hrs' : 'hr'
  const eventCost = `$${cost}`
  const isTournament = tournament ? 'Yes' : 'No';
  const ticketRatio = `${ticketsAvailable} / ${playersMax}`

  return (
    <table>
      <tbody className='event-details-table'>
        <tr className="modal-table-row">
          <td className="table-label-container">
            Title
          </td>
          <td className="table-value-container">
            {title}<br />
            <Button
              className='ticket-link'
              startIcon={<ConfirmationNumber />}
              href={`https://www.gencon.com/events/${eventLinkId}`}
              target='_blank'
            >
              Wishlist / Purchase Option
            </Button>
          </td>
        </tr>
        <TableRow category={'Game Id'} detail={gameId} />
        <TableRow category={'Event Type'} detail={eventType} />
        {gameSystem && (
          <TableRow category={'Game System'} detail={gameSystem} />
        )}
        <TableRow category={'Start Date and Time'} detail={startDateTime} />
        <TableRow category={'End Date and Time'} detail={endDateTime} />
        <TableRow category={'Duration'} detail={`${duration} ${durationSuffix}`} />
        {descriptionShort && (
          <TableRow category={'Short Description'} detail={descriptionShort} />
        )}
        {descriptionLong && (
          <TableRow category={'Long Description'} detail={descriptionLong} />
        )}
        <TableRow category={'Cost'} detail={eventCost} />
        <TableRow category={'Age Requirement'} detail={ageRequirement} />
        <TableRow category={'Experience Requirement'} detail={experienceType} />
        {materials ? (
          <TableRow category={'Materials Required'} detail={materials} />
        ) : (
          <TableRow category={'Materials Required'} detail={'None'} />
        )}
        {group && (
          <TableRow category={'Group'} detail={group} />
        )}
        {location && (
          <TableRow category={'Location'} detail={`${location}`} />
        )}
        <TableRow category={'Tournament'} detail={isTournament} />
        <TableRow category={'Tickets Available'} detail={ticketRatio} />
      </tbody>
    </table>
  )
}