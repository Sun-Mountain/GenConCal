import Link from "next/link";
import EventIcon from '@mui/icons-material/Event';
import CottageIcon from '@mui/icons-material/Cottage';
import InfoIcon from '@mui/icons-material/Info';

export default function Navigation () {
  return (
    <nav>
      <div id='navigation-container'>
        <div id='nav-title'>
          <Link className='nav-link' href='/'>
            <EventIcon fontSize='large' />
          </Link>
        </div>
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
    </nav>
  )
}