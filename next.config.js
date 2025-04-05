/************************************************************************************
 * UBICACIÓN DEL ARCHIVO: /next.config.js
 *
 * DESCRIPCIÓN:
 *  - Configuración principal de Next.js orientada a rendimiento, seguridad y SEO.
 *  - Se utiliza bundleAnalyzer opcional, alias personalizados y ajustes de Webpack para
 *    optimizar la carga de recursos y el rendimiento general.
 *  - Se incluyen cabeceras de seguridad avanzadas (CSP, HSTS, Cache-Control) para mejorar
 *    la protección y la experiencia en buscadores.
 *
 * PRINCIPIOS SOLID:
 *  1) SRP: Cada función se dedica a una tarea específica (watch, aliases, performance).
 *  2) OCP: La configuración está diseñada para poder extenderse fácilmente.
 *  3) LSP: La estructura puede sustituirse sin romper la funcionalidad.
 *  4) ISP: Cada bloque de configuración proporciona solo lo necesario a cada módulo.
 *  5) DIP: Se apoya en abstracciones de Webpack y Next.js, evitando implementaciones rígidas.
 *
 * NOTAS:
 *  - 'swcMinify' se ha eliminado porque Next.js 12.2+ la activa por defecto.
 *  - Adapta las cabeceras (especialmente CSP) y dominios de imágenes a los requerimientos de tu proyecto.
 *
 * LICENCIA MIT - Uso libre con fines pedagógicos y educativos.
 ************************************************************************************/

const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Configura las opciones de watch en desarrollo para Webpack.
 * @param {object} config - Configuración original de Webpack.
 * @param {boolean} dev - Indica si está en modo desarrollo.
 * @param {boolean} isServer - Indica si la configuración es para el servidor (SSR).
 */
function configureWatchOptions(config, dev, isServer) {
  if (dev && !isServer) {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.next'],
      poll: 500,          // Revisar cambios cada 500ms.
      aggregateTimeout: 200, // Espera 200ms tras cambios para recompilar.
    };
  }
}

/**
 * Define alias personalizados para simplificar las importaciones.
 * Evita rutas largas como ../../../components.
 * @param {object} config - Configuración original de Webpack.
 */
function configureCustomAliases(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@components': path.resolve(__dirname, 'components'),
    '@utils': path.resolve(__dirname, 'utils'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    '@lib': path.resolve(__dirname, 'lib'),
    '@pages': path.resolve(__dirname, 'pages'),
    '@styles': path.resolve(__dirname, 'styles'),
    '@repositories': path.resolve(__dirname, 'repositories'),
  };
}

/**
 * Aplica optimizaciones de rendimiento a Webpack.
 * Se ajusta la división de bundles para agrupar librerías y dependencias esenciales.
 * @param {object} config - Configuración original de Webpack.
 * @param {boolean} isServer - Indica si la configuración es para el servidor.
 */
function applyPerformanceOptimizations(config, isServer) {
  if (!isServer) {
    config.optimization.splitChunks.cacheGroups = {
      default: false,
      vendors: false,
      // Grupo "framework": agrupa React y librerías esenciales.
      framework: {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
        priority: 40,
        enforce: true,
      },
      // Grupo "lib": agrupa librerías grandes.
      lib: {
        test(module) {
          return module.size() > 160000; // Considera grandes aquellas con más de 160kb.
        },
        name(module) {
          return /node_modules\/(.*)/.exec(module.identifier())[1];
        },
        priority: 30,
        minChunks: 1,
        reuseExistingChunk: true,
      },
    };
  }
}

module.exports = withBundleAnalyzer({
  reactStrictMode: true,  // Modo estricto para detectar posibles errores.
  poweredByHeader: false, // Oculta la cabecera "X-Powered-By" por seguridad.
  compress: true,         // Habilita compresión GZIP para mejorar el rendimiento.

  images: {
    // Uso de WebP para optimizar las imágenes.
    formats: ['image/webp'],
    domains: ['talberos.tech'],
  },

  i18n: {
    // Configuración básica de internacionalización.
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },

  /**
   * Cabeceras HTTP adicionales para mejorar la seguridad y el SEO.
   * Se añaden cabeceras como CSP, HSTS y Cache-Control para activos estáticos.
   */
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        // Política de referer más segura para mejorar la privacidad y SEO.
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Content Security Policy: Ajusta las fuentes según lo que use tu proyecto.
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; " +
                 "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
                 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                 "img-src 'self' data: https://example.com https://images.example.org; " +
                 "font-src 'self' https://fonts.gstatic.com; " +
                 "connect-src 'self' https://www.google-analytics.com; " +
                 "frame-src 'none';"
        },
        // HSTS: Fuerza conexiones HTTPS seguras.
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
    // Cache-Control para archivos estáticos en el directorio _next/static.
    {
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],

  /**
   * Configuración personalizada de Webpack.
   * Se integran funciones para configurar watch, alias y optimizaciones de rendimiento.
   */
  webpack(config, options) {
    configureWatchOptions(config, options.dev, options.isServer);
    configureCustomAliases(config);
    applyPerformanceOptimizations(config, options.isServer);
    return config;
  },

  /**
   * Ejemplo de redirecciones permanentes.
   * "permanent: true" indica una redirección 308.
   */
  async redirects() {
    return [
      { source: '/old-page', destination: '/new-page', permanent: true },
    ];
  },
});
