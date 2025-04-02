/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/_document.js
 *
 * DESCRIPCIÓN:
 *  - Personaliza la estructura HTML (SSR) de tu aplicación Next.js.
 *  - Define <Html lang="es"> para accesibilidad y SEO en español.
 *  - Configura elementos globales (preconnect, dns-prefetch, etc.) para
 *    optimizar performance y experiencia de usuario.
 *  - Separa responsabilidades: Los meta tags de SEO específicos residen
 *    en cada página o en `_app.js`.
 *
 * PRINCIPIOS SOLID:
 *  1. SRP: Este archivo maneja exclusivamente la estructura base del documento.
 *  2. OCP: Fácil de extender para añadir preloads/preconnect adicionales.
 *  3. LSP: Sustituible por otra clase que extienda Document sin romper la app.
 *  4. ISP: No fuerza dependencias de SEO en páginas que no lo necesiten.
 *  5. DIP: Depende de la abstracción Document de Next.js, no de implementaciones concretas.
 */

import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * Clase MyDocument
 * ----------------
 * Extiende Document para:
 *  - Usar <Html lang="es"> y favorecer SEO e i18n para hispanohablantes.
 *  - Añadir preconnect/dns-prefetch para hosts externos (ej. Google Fonts).
 *  - Rendirizar <Main /> y <NextScript /> donde Next.js monta la app.
 */
export default class MyDocument extends Document {
  /**
   * getInitialProps:
   *  - Método estático que Next.js invoca en el servidor.
   *  - Retorna las props iniciales para renderizar el documento.
   */
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  /**
   * Render principal que define la estructura HTML base.
   *  - <Html lang="es"> para accesibilidad y SEO.
   *  - <Head> para cualquier configuración global no relacionada a SEO dinámico.
   *  - <body> con <Main /> y <NextScript /> donde Next.js inyecta la app y sus scripts.
   */
  render() {
    return (
      <Html lang="es">
        <Head>
          {/*
            Sugerencia: Preconnect a orígenes externos (por ejemplo, si usas Google Fonts),
            mejora la performance al establecer conexiones anticipadas.
            Descomenta o ajusta según tus necesidades.
          */}
          {/*
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          */}

          {/*
            Si deseas precargar fuentes u otros recursos críticos:
            <link
              rel="preload"
              as="font"
              href="/fonts/MiFuentePersonalizada.woff2"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          */}

          {/*
            Metadato que indica el soporte de esquemas de color:
            "light dark" sugiere que tu web soporta ambos modos.
          */}
          <meta name="color-scheme" content="light dark" />

          {/*
            Definición de color de la interfaz en navegadores móviles:
            - media="(prefers-color-scheme: light)" => color claro
            - media="(prefers-color-scheme: dark)" => color oscuro
            Ajusta los valores (#ffffff y #000000) según tu preferencia de marca.
          */}
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#1f1f1f" media="(prefers-color-scheme: dark)" />

          {/*
            Otras configuraciones globales que no requieran interacción dinámica:
            - Fuentes, íconos de sitios, scripts externos opcionales, etc.
            - Recuerda que el SEO dinámico y los metadatos principales
              se manejan en cada página o en _app.js.
          */}
        </Head>

        <body>
          {/*
            <Main /> renderiza la aplicación React,
            <NextScript /> inyecta los scripts necesarios de Next.js
          */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
