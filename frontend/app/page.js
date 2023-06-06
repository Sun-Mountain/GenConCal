import Image from 'next/image'
import styles from './page.module.css'

import cleanData from '@/helpers/cleanData';

export default function Home() {

  const data = cleanData();

  console.log(data);

  return (
    <main>
    </main>
  )
}
