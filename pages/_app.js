
/**
 * MIT License
 * -----------
 * Archivo: /pages/_app.js
 *
 * Gestiona el renderizado global de la aplicación, incluyendo metadatos,
 * estilos y manejo del modo oscuro/claro.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import '@styles/globals.css'; // Tus estilos globales

function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const className = 'dark-mode';
    if (isDarkMode) {
      document.documentElement.classList.add(className);
    } else {
      document.documentElement.classList.remove(className);
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return [isDarkMode, toggleTheme];
}

export default function MyApp({ Component, pageProps }) {
  const GA_TRACKING_ID = ''; // Google Analytics ID
  const router = useRouter();
  const [isDarkMode, toggleTheme] = useTheme();

  const globalTitle = 'Talberos - Tablas Interactivas Estilo Excel';
  const globalDescription = 'Talberos es una librería gratuita y open-source para React, integrando tablas estilo Excel con filtros avanzados, exportación y modo oscuro/claro.';
  const globalKeywords = 'Talberos, tablas, Excel, React, Next.js, Material UI, exportar Excel, open-source, MIT';
  const globalUrl = 'https://talberos.tech';
  const globalImage = '/default.png';

  return (
    <>
      {/* Metadatos Globales (SEO, Favicons) */}
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <title>{globalTitle}</title>
        <meta name="description" content={globalDescription} />
        <meta name="keywords" content={globalKeywords} />
        <meta name="author" content="[Tu nombre o seudónimo]" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={globalUrl} />
        <meta property="og:title" content={globalTitle} />
        <meta property="og:description" content={globalDescription} />
        <meta property="og:image" content={globalImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={globalUrl} />
        <meta name="twitter:title" content={globalTitle} />
        <meta name="twitter:description" content={globalDescription} />
        <meta name="twitter:image" content={globalImage} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-title" content="Talberos" />
        <link rel="canonical" href={globalUrl} />
      </Head>

      {/* Google Analytics */}
      {GA_TRACKING_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      <Component {...pageProps} isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
    </>
  );
}
