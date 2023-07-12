import Link from 'next/link';
import { AttachMoney, GitHub } from '@mui/icons-material';

export default function About() {
  return (
    <div className='about-content'>
      <h2>About The App</h2>
      <div className='paragraph'>
        GenCon Calendar (or GenConCal for short) is an open source project inspired by my frustration in trying to keep track of what events I want to attend and prioritize. What ends up happening is going back and forth between the <Link href='https://www.gencon.com/events' target='_blank'>GenCon Event Finder</Link> and a very involved spreadsheet.
      </div>

      <h3>Acknowledgements</h3>
      <div className='paragraph'>
        Inspired by Jon Schultz&apos;s <Link href='https://gencon.eventdb.us/' target='_blank'>GenCon Event Database</Link>.
      </div>
      <div className='paragraph'>
        Made with the <Link href='https://mui.com/' target='_blank'>Material UI</Link> library.
      </div>

      <h3>Important Links</h3>
      <ul>
        <li>
          <Link href='https://github.com/Sun-Mountain/GenConCal' target='_blank' className='link-with-icon'>
            <GitHub />
            <div className='label'>
              GenConCal on GitHub
            </div>
          </Link>
        </li>
        {/* <li>
          <Link href='https://www.paypal.com/donate/?hosted_button_id=SWMVBLFAF77T6' target='_blank' className='link-with-icon'>
            <AttachMoney />
            <div className='label'>
              Support this Project
            </div>
          </Link>
          <div className='subtext'>
            If you would like to be listed as a supporter, please include your name and/or a link to whatever you would like to promote. I may use discretion if the name and/or link is deemed inappropriate for a general audience.
          </div>
        </li> */}
      </ul>
    </div>
  )
}
