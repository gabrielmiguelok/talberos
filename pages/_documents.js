/**
 * MIT License
 * -----------
 * Archivo: /pages/_document.js
 *
 * DESCRIPCIÓN:
 *  - Personaliza la estructura HTML (renderizado en servidor) de tu aplicación Next.js.
 *  - Asegura una buena accesibilidad (lang="es"), performance (preconnect), y SEO base.
 *  - Separa esta lógica del meta SEO más detallado, que reside en `_app.js` o en cada página.
 *
 * PRINCIPIOS SOLID:
 *  - SRP (Single Responsibility Principle): Este archivo SOLO gestiona estructura y
 *    configuración base de <html>, <head>, <body>, en el servidor.
 *  - Evita mezclar lógica de negocio o metadatos dinámicos,
 *    que se manejan en `_app.js` o las propias páginas.
 */

import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * Clase MyDocument
 * ---------------
 * Extiende la clase Document de Next.js para:
 *  - Inyectar <Html lang="es">, optimizando accesibilidad y SEO.
 *  - Añadir links de preconnect/preload para mejorar performance.
 *  - Dejar <Main /> y <NextScript /> para que Next.js cargue la aplicación.
 */
export default class MyDocument extends Document {
  /**
   * getInitialProps:
   *  - Método estático que Next.js llama en el servidor para obtener
   *    las props iniciales necesarias para renderizar el documento.
   * @param {import('next/document').DocumentContext} ctx - contexto de Next.js
   * @returns {Promise<import('next/document').DocumentInitialProps>}
   */
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  /**
   * Render principal.
   *  - Estructura básica del documento: <Html lang="es">, <Head>, <body>.
   */
  render() {
    return (
      <Html lang="es">
        <Head>
          {/*
            Preconnect a orígenes externos para mejorar la performance
            (por ejemplo, Google Fonts, si lo usas).
            Ajusta o descomenta según tu caso.
          */}
          {/*
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          */}

          {/*
            Preload de fuentes o recursos críticos (descomenta y ajusta si lo requieres).
            <link
              rel="preload"
              as="font"
              href="/fonts/MyCustomFont.woff2"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          */}

          {/*
            Metadatos para indicar esquema de color preferido (accesibilidad).
            "light dark" indica que tu sitio soporta ambos modos.
          */}
          <meta name="color-scheme" content="light dark" />

          {/*
            Configura theme-color para cada modo, ayudando a navegadores móviles
            a personalizar el UI (barra de direcciones).
            Ajusta los colores a tu preferencia.
          */}
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        </Head>

        <body>
          {/*
            Main renderiza la aplicación react,
            NextScript inyecta los scripts necesarios de Next.js
          */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
