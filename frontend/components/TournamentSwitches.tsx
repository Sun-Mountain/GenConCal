import Switch from '@mui/material/Switch';
import { TournamentSwitches } from '@/interfaces/Components';

export default function TournamentSwitches ({
  hideTourney,
  setHideTourney,
  tourneyOnly,
  setTourneyOnly
}: TournamentSwitches) {
  const hideTourneyAria = { inputProps: { 'aria-label': 'hide tournament switch' } };
  const showTourneyAria = { inputProps: { 'aria-label': 'show only tournaments switch' } };
  const hideTourneyLabel = hideTourney ? 'Include Tournaments' : 'Hide Tournaments';
  const showTourneyLabel = tourneyOnly ? 'Show All Events' : 'Show Tournaments Only';

  const hideTourneyChange = () => {
    if (tourneyOnly) {
      setTourneyOnly(!tourneyOnly);
    }

    setHideTourney(!hideTourney);
  }

  const showTourneyChange = () => {
    if (hideTourney) {
      setHideTourney(!hideTourney);
    }

    setTourneyOnly(!tourneyOnly)
  }

  return (
    <>
      <div className='switch-container'>
        <strong>{showTourneyLabel}</strong>
        <Switch checked={tourneyOnly} onChange={showTourneyChange}  {...showTourneyAria} />
      </div>
      <div className='switch-container'>
        <strong>{hideTourneyLabel}</strong>
        <Switch checked={hideTourney} onChange={hideTourneyChange} {...hideTourneyAria} />
      </div>
    </>
  );
}