import { useRouter } from "next/router";
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/images/logo.png'

export default function Navigation () {

  const router = useRouter();

  return (
    <nav>
      <Link id='logo-container' href='/'>
        <Image
          alt='GenCon Calendar Logo'
          width={60}
          height={60}
          src={Logo}
        />
      </Link>

      <ul id='nav-links'>
        <li className={router.pathname == "/" ? "link-container active" : "link-container"}>
          <Link className='nav-link' href="/">Home</Link>
        </li>
        <li className={router.pathname == "/about" ? "link-container active" : "link-container"}>
          <Link className='nav-link' href="/about">About</Link>
        </li>
      </ul>

    </nav>
  )
}