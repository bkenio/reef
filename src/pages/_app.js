import '../styles/index.css';
import React, { useEffect, useReducer, } from 'react';
import Head from 'next/head';
import { Provider, } from 'next-auth/client';
import { useRouter, } from 'next/router';
import * as gtag from '../utils/gtag';
import { Chakra, } from '../styles/chakra';
import { UploadContext, } from '../context/UploadContext';
import UploadReducer from '../reducers/UploadReducer';

function App({ Component, pageProps }) {
  const router = useRouter();
  const [uploads, dispatch] = useReducer(UploadReducer, []);
  
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon.ico'/>
        <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'/>
      </Head>
      <UploadContext.Provider value={{ uploads, dispatch }}>
        <Provider session={pageProps.session}>
          <Chakra cookies={pageProps.cookies}>
            <Component {...pageProps} />
          </Chakra>
        </Provider>
      </UploadContext.Provider>
    </>
  );
}

export default App;
