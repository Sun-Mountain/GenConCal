
import { useState } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonGroupProps } from '@/assets/interfaces';

export default function ButtonGroup({
  groupLabel,
  hiddenList,
  handleFilter,
  labels,
}: ButtonGroupProps) {
  return (
    <div className='filter-component-container'>
      <strong>
        {groupLabel}
      </strong>
      <div className='btn-container'>
        {labels.map((label: string) => {
          const visible = !hiddenList.includes(label);
          return (
            <div key={label}>
              <Button
                onClick={() => handleFilter({groupLabel, label})}
                className={`${visible ? 'visible' : 'hidden'} toggle-btn`}
                startIcon={visible ? <CheckIcon /> : <CloseIcon />}
              >
                {label}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  );
}