/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/_app.js
 *
 * DESCRIPCIÓN:
 *   - Configura la aplicación Next.js en su conjunto, estableciendo:
 *       1) Manejo y persistencia del tema (oscuro/claro).
 *       2) Integración opcional con Google Analytics.
 *   - Este archivo se carga antes de cualquier página de la aplicación.
 *
 * OBJETIVO:
 *   - Centralizar ajustes globales (tema, GA, etc.) y NO los metadatos SEO,
 *     dejándolos en cada página para un control más granular.
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   1. SRP, 2. OCP, 3. LSP, 4. ISP, 5. DIP
 *
 * LICENCIA:
 *   - Este código es de uso libre bajo licencia MIT.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import '@styles/globals.css';
import { useRouter } from 'next/router';

const GA_TRACKING_ID = ''; // Reemplaza con tu Google Analytics ID si lo deseas
const DARK_MODE_CLASSNAME = 'dark-mode';

/**
 * Hook para manejo de modo oscuro/claro.
 */
function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(DARK_MODE_CLASSNAME);
    } else {
      document.documentElement.classList.remove(DARK_MODE_CLASSNAME);
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return [isDarkMode, toggleTheme];
}

export default function MyApp({ Component, pageProps }) {
  const [isDarkMode, toggleTheme] = useTheme();
  const router = useRouter();

  return (
    <>
      <Head>
        {/* Metadatos básicos globales (opcional) */}
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </Head>

      {/* Google Analytics (solo se activa si GA_TRACKING_ID tiene valor) */}
      {GA_TRACKING_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname
              });
            `}
          </Script>
        </>
      )}

      <Component
        {...pageProps}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
    </>
  );
}
