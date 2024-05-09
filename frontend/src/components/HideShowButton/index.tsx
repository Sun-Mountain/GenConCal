import Button from '@components/UI/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface Props {
  show?: boolean;
  onClick?: () => void;
  buttonTitle?: string;
}

const index = ({
  show = true,
  onClick,
  buttonTitle
}: Props) => {
  const icon = show ? <VisibilityIcon /> : <VisibilityOffIcon />;

  return (
    <Button>
      <div className='icon-container'>
        {icon}
      </div>
      {buttonTitle}
    </Button>
  )
}

export default index;