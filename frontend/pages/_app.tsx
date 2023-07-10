'use client'

import { ReactElement, ReactNode, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'

import parseData from '@/helpers/parseData'

export const { eventData, filteredEvents } = parseData()

import '@/assets/styles/application.scss'

import Navigation from '@/components/UI/Navigation'

export const metadata = {
  title: 'GenCon Cal',
  description: 'Generated by create next app',
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [hasMounted, setHasMounted] = useState<boolean>(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon.ico'/>
      </Head>
      <Navigation />
      <main>
        { !hasMounted ? (
          <div>
            Loading...
          </div>
        ) : (
          <Component {...pageProps} />
        )}
        <Analytics />
      </main>
    </>
  )
}
