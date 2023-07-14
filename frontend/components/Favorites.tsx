import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FavoritesProps } from "@/assets/interfaces";
import EventCard from "@/components/UI/EventCard";
import PopoverButton from '@/components/UI/PopOverButton';
import findEvent from "@/helpers/findEvent";

export default function Favorites ({ handleFaves }: FavoritesProps) {
  const listOfFaves = JSON.parse(localStorage.getItem('faves') || '[]');
  const numOfFaves = listOfFaves.length;

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
        {listOfFaves.map((fave: number, index: number) => {
          var faveEvent = findEvent(fave);
          return <EventCard key={index} event={faveEvent} handleFaves={handleFaves} />;
        })}
      </PopoverButton>
    </div>
  )
}