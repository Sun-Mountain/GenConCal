import { Suspense } from "react"
import dynamic from 'next/dynamic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const EventListing = dynamic(() => import("./EventListing"), {
  loading: () => <b>Loading...</b>,
});

import { ChoiceComponent } from "@/interfaces/Components"
import TimeCollectionHeader from '@/components/TimeCollectionHeader';

export default function ChoicesComponent ({
  date,
  dateChoices,
  handleChoice
}: ChoiceComponent) {
  return (
    <div className="choices-container">
      {dateChoices.length ? (
        <>
          {dateChoices.map((eventIndex: number) => {
            return (
              <Suspense key={eventIndex}>
                <TimeCollectionHeader />
                <EventListing
                  key={eventIndex}
                  eventIndex={eventIndex}
                  handleChoice={handleChoice}
                  type='choice'
                />
              </Suspense>
            )
          })}
        </>
      ) : (
        <div className="no-choices">
          There are no events set aside for {date}. To choose an event, click the add to list icon:&nbsp;&nbsp;<PlaylistAddIcon />
        </div>
      )}
    </div>
  )
}