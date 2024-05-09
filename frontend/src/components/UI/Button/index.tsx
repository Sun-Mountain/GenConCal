'use client';

import { MouseEventHandler, MouseEvent } from 'react';
import { Button as BaseButton } from '@mui/base/Button';

interface Props {
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  href?: string;
  buttonClasses?: string;
}

const index = ({
  children,
  onClick,
  disabled = false,
  href,
  buttonClasses
}: Props) => {

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(event);
  };

  return (
    <BaseButton
      onClick={handleClick}
      disabled={disabled}
      href={href}
      className={buttonClasses}
    >
      {children}
    </BaseButton>
  )
}

export default index;