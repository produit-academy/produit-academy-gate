import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import '../styles/globals.css';
import '../styles/Home.css';
import '../styles/Auth.css';
import '../styles/Dashboard.css';
import CookieConsent from '../components/CookieConsent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const initMobile = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {
      }
    };
    initMobile();

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Produit Academy GATE | Mock Tests, PYQs & Assessment Portal</title>
        <meta
          name="description"
          content="Specialized preparation platform for GATE aspirants across Electrical, Mechanical, Civil, Computer Science, and Electronics engineering."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-gate" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      <ul className="floating-elements" aria-hidden="true">
        <li>α</li>
        <li>β</li>
        <li>Σ</li>
        <li>π</li>
        <li>∫</li>
        <li>λ</li>
        <li>ω</li>
        <li>μ</li>
        <li>δ</li>
        <li>ε</li>
      </ul>
      <Component {...pageProps} />
      <CookieConsent />
    </>
  );
}

export default MyApp;