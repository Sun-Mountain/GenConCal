import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/images/logo.png';

export default function Navigation () {
  return (
    <nav>
      <div id="navigation-container">
        <Image
          alt='GenCon Calendar Logo'
          width={60}
          height={60}
          src={Logo}
        />
        <div id="nav-link-container">
          <Link href="/">
            Home
          </Link>
          <Link href="/about">
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}