/************************************************************************************
 * UBICACIÓN DEL ARCHIVO: /next.config.js
 *
 * DESCRIPCIÓN:
 *  - Configuración principal de Next.js optimizada y modularizada.
 *  - Se aplica bundleAnalyzer opcional, alias personalizados, ajuste de webpack y
 *    buenas prácticas de seguridad y rendimiento.
 *
 *  - Esta versión remueve la clave 'swcMinify' porque, a partir de Next.js 12.2,
 *    la minificación con SWC ya viene activada por defecto.
 *
 * Licencia MIT - Uso libre con fines pedagógicos y educativos.
 ************************************************************************************/

const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * @description Configura las opciones específicas del watch para desarrollo
 * @param {object} config - Configuración original de Webpack
 * @param {boolean} dev - Indica si está en modo desarrollo
 * @param {boolean} isServer - Indica si la configuración es para el servidor
 */
function configureWatchOptions(config, dev, isServer) {
  if (dev && !isServer) {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.next'],
      poll: 500,
      aggregateTimeout: 200,
    };
  }
}

/**
 * @description Establece alias personalizados para simplificar las importaciones
 * @param {object} config - Configuración original de Webpack
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
 * @description Aplica recomendaciones adicionales para optimizar el rendimiento
 * @param {object} config - Configuración original de Webpack
 * @param {boolean} isServer - Indica si la configuración es para el servidor
 */
function applyPerformanceOptimizations(config, isServer) {
  // Ajuste de splitChunks para mejorar la carga si es necesario (client-side)
  if (!isServer) {
    config.optimization.splitChunks.cacheGroups = {
      default: false,
      vendors: false,
      framework: {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
        priority: 40,
        enforce: true,
      },
      lib: {
        test(module) {
          return module.size() > 160000; // librerías grandes
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

/**
 * CONFIGURACIÓN PRINCIPAL DE NEXT.JS
 * Bajo principios SOLID y Clean Code:
 * - Se eliminó 'swcMinify' para evitar la advertencia, pues viene habilitado por defecto.
 */
module.exports = withBundleAnalyzer({
  reactStrictMode: true, // Modo estricto para detectar problemas potenciales
  poweredByHeader: false, // Desactiva la cabecera "X-Powered-By" por seguridad
  compress: true, // Habilita la compresión GZIP para un mejor rendimiento

  images: {
    // Usa formato WebP por defecto, y dominios externos permitidos
    formats: ['image/webp'],
    domains: ['example.com', 'images.example.org'],
  },

  i18n: {
    // Configuración básica para internacionalización
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'same-origin' },
      ],
    },
  ],

  webpack(config, options) {
    configureWatchOptions(config, options.dev, options.isServer);
    configureCustomAliases(config);
    applyPerformanceOptimizations(config, options.isServer);
    return config;
  },

  // Ejemplo básico de redirecciones
  async redirects() {
    return [
      { source: '/old-page', destination: '/new-page', permanent: true },
    ];
  },
});
