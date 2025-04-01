/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/_app.js
 *
 * DESCRIPCIÓN:
 *   - Configura la aplicación Next.js en su conjunto, estableciendo:
 *       1) Metadatos y SEO globales.
 *       2) Manejo y persistencia del tema (oscuro/claro).
 *       3) Integración opcional con Google Analytics.
 *   - Este archivo se carga antes de cualquier página de la aplicación.
 *
 * OBJETIVO:
 *   - Centralizar ajustes globales y evitar duplicaciones de metadatos en cada
 *     página individual.
 *   - Facilitar la escalabilidad y mantenibilidad del proyecto.
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   1. SRP (Single Responsibility Principle):
 *       - Se encarga únicamente de la configuración global de la aplicación
 *         (temas, SEO, GA), evitando mezclar responsabilidades.
 *   2. OCP (Open/Closed Principle):
 *       - Permite agregar o modificar metadatos y lógica de inicialización
 *         sin alterar la estructura principal.
 *   3. LSP (Liskov Substitution Principle):
 *       - MyApp puede reemplazarse por otro componente que cumpla la misma
 *         interfaz de App en Next.js sin romper la aplicación.
 *   4. ISP (Interface Segregation Principle):
 *       - Cada parte (tema, GA, metadatos) está separada, sin forzar
 *         dependencias innecesarias en otros módulos.
 *   5. DIP (Dependency Inversion Principle):
 *       - El uso de GA o el manejo de tema dependen de abstracciones (custom hooks,
 *         variables de entorno) en lugar de implementaciones rígidas.
 *
 * LICENCIA:
 *   - Este código es de uso libre bajo licencia MIT.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import '@styles/globals.css'; // Estilos globales

/**
 * CONSTANTES GLOBALES
 * Definen la configuración de metadatos SEO y opciones principales de la aplicación.
 */
const GA_TRACKING_ID = ''; // Inserta aquí tu Google Analytics ID si lo deseas
const DARK_MODE_CLASSNAME = 'dark-mode';

/**
 * Título global de la aplicación
 */
const GLOBAL_TITLE = 'Talberos - Un ecosistema Open Source integral para desarrollos React';

/**
 * Descripción global para SEO y redes sociales
 */
const GLOBAL_DESCRIPTION =
  'Talberos es un framework completamente Open Source construido con React y Next.js, que aplica estrictamente principios SOLID y prácticas claras de Clean Code';

/**
 * Palabras clave globales para SEO
 */
const GLOBAL_KEYWORDS =
  'Talberos, tablas, Excel, React, Next.js, Material UI, exportar Excel Like, open-source, MIT';

/**
 * Autor global indicado en metadatos
 */
const GLOBAL_AUTHOR = 'Gabriel Hércules Miguel';

/**
 * URL base de la aplicación (actualizar según despliegue real)
 */
const GLOBAL_URL = 'https://talberos.tech';

/**
 * Imagen utilizada en la previsualización en redes sociales (formato .png)
 */
const GLOBAL_IMAGE = 'https://talberos.tech/preview.png';

/**
 * Custom Hook para el manejo del tema (oscuro o claro).
 * - Agrega o remueve la clase correspondiente en el elemento <html>.
 * - Devuelve el estado del modo oscuro y una función para alternarlo.
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

/**
 * Componente principal de la aplicación (MyApp).
 *
 * @param {Object} props - Propiedades recibidas de Next.js.
 * @param {JSX.Element} props.Component - Componente de página que se está renderizando.
 * @param {Object} props.pageProps - Propiedades iniciales del componente de página.
 *
 * @returns {JSX.Element} Estructura global de la aplicación Next.js con metadatos y estilos.
 */
export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isDarkMode, toggleTheme] = useTheme();

  return (
    <>
      {/* Metadatos Globales */}
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <meta name="robots" content="index, follow" />
        <title>{GLOBAL_TITLE}</title>
        <meta name="description" content={GLOBAL_DESCRIPTION} />
        <meta name="keywords" content={GLOBAL_KEYWORDS} />
        <meta name="author" content={GLOBAL_AUTHOR} />

        {/* Open Graph (OG) para redes sociales */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={GLOBAL_URL} />
        <meta property="og:title" content={GLOBAL_TITLE} />
        <meta property="og:description" content={GLOBAL_DESCRIPTION} />
        <meta property="og:image" content={GLOBAL_IMAGE} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={GLOBAL_URL} />
        <meta name="twitter:title" content={GLOBAL_TITLE} />
        <meta name="twitter:description" content={GLOBAL_DESCRIPTION} />
        <meta name="twitter:image" content={GLOBAL_IMAGE} />

        {/* Favicons y Apple Touch Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-title" content="Talberos" />

        {/* URL canónica del sitio */}
        <link rel="canonical" href={GLOBAL_URL} />

        {/* Datos Estructurados (JSON-LD) para SEO global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Talberos',
              url: GLOBAL_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${GLOBAL_URL}/?s={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </Head>

      {/* Google Analytics (carga solo si GA_TRACKING_ID tiene valor) */}
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

      {/* Renderizamos el componente de página con sus props.
          Se pasa el estado y la función para alternar el tema si la página desea usarlo. */}
      <Component {...pageProps} isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
    </>
  );
}
