import { useRouter } from "next/router";
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/images/logo.png'

export default function Navigation () {

  const router = useRouter();

  return (
    <nav>
      <div id="top-nav">
        <Link id='logo-container' href='/'>
          <Image
            alt='GenCon Calendar Logo'
            width={60}
            height={60}
            src={Logo}
          />
        </Link>

        <ul id='nav-links'>
          <li className={`link-container ${router.pathname == "/" ? "active" : null}`}>
            <Link className='nav-link' href="/">Home</Link>
          </li>
          <li className={`link-container ${router.pathname == "/about" ? "active" : null}`}>
            <Link className='nav-link' href="/about">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}