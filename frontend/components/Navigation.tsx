import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/images/logo.png'

export default function Navigation () {
  return (
    <nav>
      <Image
        alt='GenCon Calendar Logo'
        width={60}
        height={60}
        src={Logo}
      />

      <ul id='nav-links'>
        <li>
          <Link className='nav-link' href="/">Home</Link>
        </li>
        <li>
          <Link className='nav-link' href="/about">About</Link>
        </li>
      </ul>

    </nav>
  )
}