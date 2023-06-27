import { NewEvent } from "@/assets/interfaces";

export default function EventCard ({event}: {event: NewEvent}) {
  return (
    <div>
      {event.title}
    </div>
  )
}