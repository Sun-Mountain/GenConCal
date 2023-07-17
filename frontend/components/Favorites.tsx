import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FavoritesProps } from "@/assets/interfaces";
import EventCard from "@/components/UI/EventCard";
import PopoverButton from '@/components/UI/PopOverButton';
import findEvent from "@/helpers/findEvent";

export default function Favorites ({ faves, handleFaves }: FavoritesProps) {
  const numOfFaves = faves.length;

  return (
    <div>
      <PopoverButton
        numOfFaves={numOfFaves}
      >
        <Button
          className='export-btn'
          href="/export"
          size='small'
          startIcon={<OpenInNewIcon />}
          target="_blank"
          variant='outlined'
        >
          Export Favorites
        </Button>
        {faves.map((fave: number, index: number) => {
          var faveEvent = findEvent(fave);
          return <EventCard key={index} event={faveEvent} handleFaves={handleFaves} />;
        })}
      </PopoverButton>
    </div>
  )
}