import Button from '@mui/material/Button';
import { ClearFavesProps } from "@/assets/interfaces";

export default function ClearFavoritesBtn ({ setFaves }: ClearFavesProps) {

  const clearFavorites = () => {
    localStorage.setItem('faves', JSON.stringify([]))
    setFaves([])
  }

  return (
    <Button onClick={clearFavorites}>
      Clear Favorites
    </Button>
  )
}