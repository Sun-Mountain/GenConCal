import { Button } from '@mui/material';
import { FavoritesProps } from "@/assets/interfaces";
import { ClearFavoritesBtn, EventCard, PopoverButton } from '@/components';
import { findEvent } from "@/helpers";


export function Favorites ({ faves, handleFaves, setFaves }: FavoritesProps) {
  const numOfFaves = faves.length;

  return (
    <div>
      <PopoverButton
        numOfFaves={numOfFaves}
      >
        <div className='favorites-btns-container'>
          <div className='btn'>
            <ClearFavoritesBtn setFaves={setFaves} />
          </div>
          <Button
            variant='contained'
            className='export-btn btn'
            href="/export"
          >
            Export Favorites
          </Button>
        </div>
        {faves.map((fave: number, index: number) => {
          var faveEvent = findEvent(fave);
          return <EventCard key={index} event={faveEvent} handleFaves={handleFaves} />;
        })}
      </PopoverButton>
    </div>
  )
}