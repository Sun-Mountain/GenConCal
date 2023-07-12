import Link from "next/link";
import CottageIcon from '@mui/icons-material/Cottage';
import InfoIcon from '@mui/icons-material/Info';
import lastUpdated from '@/assets/events/lastUpdate.json';

console.log(lastUpdated)

export default function Navigation () {

  const dateValue = new Date(JSON.parse(lastUpdated.date));
  const dateString = dateValue.toUTCString()

  console.log(dateString)

  return (
    <nav>
      <div id='nav-wrapper'>
        <div id='navigation-links-container'>
          <ul id='nav-link-container'>
            <li className='link-container'>
              <Link className='nav-link' href='/'>
                <CottageIcon />&nbsp;
                Home
              </Link>
            </li>
            <li className='link-container'>
              <Link className='nav-link' href='/about'>
                <InfoIcon />&nbsp;
                About
              </Link>
            </li>
          </ul>
        </div>
        <div id='update-date-container'>
          Lasted Updated: {dateString}
        </div>
      </div>
    </nav>
  )
}