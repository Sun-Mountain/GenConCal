import { useRouter } from "next/router";
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/images/logo.png';

export default function Navigation () {
  const router = useRouter();

  return (
    <nav>
      <div id="navigation-container">
        <div id="site-logo-container">
          <Image
            alt='GenCon Calendar Logo'
            width={60}
            height={60}
            src={Logo}
          />
        </div>
        <div id="nav-link-container">
          <Link className={`link-container ${router.pathname == "/" ? "active" : null}`} href="/">
            Home
          </Link>
          <Link className={`link-container ${router.pathname == "/about" ? "active" : null}`} href="/about">
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}