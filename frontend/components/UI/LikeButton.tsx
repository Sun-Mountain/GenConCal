import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { LikeButtonProps } from "@/assets/interfaces";

export default function LikeButton ({ handleFaves }: LikeButtonProps) {

  return (
    <>
      <IconButton
          className='icon-button'
          aria-label="zoom in icon"
          onClick={handleFaves}
        >
          <FavoriteBorderIcon />
        </IconButton>
    </>
  )

}