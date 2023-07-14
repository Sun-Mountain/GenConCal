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
        {faves.map((fave, index) => {
          var faveEvent = findEvent(fave);
          return <EventCard key={index} event={faveEvent} handleFaves={handleFaves} />;
        })}
      </PopoverButton>
    </div>
  )
}