import { Button } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ButtonGroupProps } from '@/assets/interfaces';

export function ButtonGroup({
  groupLabel,
  hiddenList,
  handleFilter,
  labels,
}: ButtonGroupProps) {
  return (
    <div className='filter-component-container button-group-container'>
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
                startIcon={visible ? <Check /> : <Close />}
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