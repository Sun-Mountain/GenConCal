'use client';

import { useState } from 'react';

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
  const [visible, setVisible] = useState(show);
  const icon = visible ? <VisibilityIcon /> : <VisibilityOffIcon />;

  const handleClick = () => {
    if (onClick) onClick();
    setVisible(!visible);
  }

  return (
    <Button
      onClick={handleClick}
    >
      <div className='hide-show-icon'>
        {icon}
      </div>
      {buttonTitle}
    </Button>
  )
}

export default index;