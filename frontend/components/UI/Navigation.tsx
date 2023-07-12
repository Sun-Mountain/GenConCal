import Link from "next/link";
import CottageIcon from '@mui/icons-material/Cottage';
import InfoIcon from '@mui/icons-material/Info';
import lastUpdated from '@/assets/events/lastUpdate.json';

console.log(lastUpdated)

export default function Navigation () {

  const dateValue = JSON.parse(lastUpdated.date);
  // const newDate = new Date(dateValue);

  console.log(dateValue)

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
        <div>
          {/* {dateValue} */}
        </div>
      </div>
    </nav>
  )
}