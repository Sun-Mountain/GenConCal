import { Button } from '@mui/material';
import { ClearFavesProps } from "@/assets/interfaces";

export function ClearFavoritesBtn ({ setFaves }: ClearFavesProps) {
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