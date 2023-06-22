import { MouseEvent, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ToggleButtonGroupInterface } from '@/assets/interfaces/ComponentInterfaces';

export default function ToggleButtonsMultiple({ 
  btnValues,
  filter,
  filterFor,
  setFilterFor
}: ToggleButtonGroupInterface) {
  const btnKeys = Object.values(btnValues);
  const [show, setShow] = useState(btnKeys);

  const addEventsToFilter = (eventIds: number[]) => {
    var newFilters = [...filterFor, ...eventIds];
    setFilterFor(newFilters);
  }

  const removeEventsFromFilter = (eventIds: number[]) => {
    var newFilters = filterFor.filter(val => !eventIds.includes(val));
    setFilterFor(newFilters);
  }

  const handleFilter = (value: string) => {
    if (show.includes(value)) {
      addEventsToFilter(filter[value]);
    } else {
      removeEventsFromFilter(filter[value]);
    }
  }

  const handleFormat = (
    event: MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    setShow(newFormats);
  };

  return (
    <ToggleButtonGroup
      orientation='vertical'
      value={show}
      onChange={handleFormat}
      aria-label="text formatting"
    >
      {btnKeys.map((key, index) => {
        const keyIncluded = show.includes(key);
        const showClass = keyIncluded ? 'visible' : 'hidden';
        return (
          <ToggleButton
            className={`toggle-button ${showClass}`}
            key={index}
            value={key}
            aria-label={key}
            onClick={() => handleFilter(key)}
          >
            {keyIncluded ? (
              <CheckCircleIcon />
            ) : (
              <CancelIcon />
            )} &nbsp;
            {key}
          </ToggleButton>
        )
      })}
      {/* <ToggleButton value="bold" aria-label="bold">
        <FormatBoldIcon />
      </ToggleButton>
      <ToggleButton value="italic" aria-label="italic">
        <FormatItalicIcon />
      </ToggleButton>
      <ToggleButton value="underlined" aria-label="underlined">
        <FormatUnderlinedIcon />
      </ToggleButton>
      <ToggleButton value="color" aria-label="color" disabled>
        <FormatColorFillIcon />
        <ArrowDropDownIcon />
      </ToggleButton> */}
    </ToggleButtonGroup>
  );
}