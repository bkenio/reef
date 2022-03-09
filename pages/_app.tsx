import '../styles/index.css'

import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { RecoilRoot } from 'recoil'

import { UserContext } from '../contexts/user'
import useUser from '../hooks/useUser'
import theme from '../styles/theme'

export default function App(props: AppProps) {
  const userState = useUser()
  const { Component, pageProps } = props
  if (!userState) return null

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        />
      </Head>
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <UserContext.Provider value={userState}>
            <Component {...pageProps} />
          </UserContext.Provider>
        </ChakraProvider>
      </RecoilRoot>
    </>
  )
}
