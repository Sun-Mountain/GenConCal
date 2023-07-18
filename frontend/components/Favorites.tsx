import Link from 'next/link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FavoritesProps } from "@/assets/interfaces";
import ClearFavoritesBtn from '@/components/ClearFavoritesBtn';
import EventCard from "@/components/UI/EventCard";
import PopoverButton from '@/components/UI/PopOverButton';
import findEvent from "@/helpers/findEvent";


export default function Favorites ({ faves, handleFaves, setFaves }: FavoritesProps) {
  const numOfFaves = faves.length;

  return (
    <div>
      <PopoverButton
        numOfFaves={numOfFaves}
      >
        <div className='favorites-btns-container'>
          <Link
            className='export-btn'
            href="/export"
            target="_blank"
          >
            <OpenInNewIcon className='link-icon' /> Export Favorites
          </Link>
          <ClearFavoritesBtn setFaves={setFaves} />
        </div>
        {faves.map((fave: number, index: number) => {
          var faveEvent = findEvent(fave);
          return <EventCard key={index} event={faveEvent} handleFaves={handleFaves} />;
        })}
      </PopoverButton>
    </div>
  )
}