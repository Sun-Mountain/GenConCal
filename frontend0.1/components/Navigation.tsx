import Link from "next/link";
import { Event, Cottage, Info } from '@mui/icons-material';

export function Navigation () {
  return (
    <nav>
      <div id='navigation-links-container'>
        <div id='nav-title'>
          <Link className='nav-link' href='/'>
            <Event fontSize='large' />
          </Link>
        </div>
        <ul id='nav-link-container'>
          <li className='link-container'>
            <Link className='nav-link' href='/'>
              <Cottage />&nbsp;
              Home
            </Link>
          </li>
          <li className='link-container'>
            <Link className='nav-link' href='/about'>
              <Info />&nbsp;
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}