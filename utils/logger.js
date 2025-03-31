/******************************************************************************
 * UBICACIÓN: ./utils/logger.js
 * LICENCIA: MIT
 * ----------------------------------------------------------------------------
 * DESCRIPCIÓN:
 *   - Configura Winston para generar logs en consola y en un archivo de errores.
 *   - Se minimiza la sobrecarga de logs, siguiendo recomendaciones de SOLID:
 *     - SRP: Este archivo se limita únicamente a la configuración de Winston.
 *     - No se descarga ningún log de manera automática (sin combined.log).
 *   - Si el código se ejecuta en el lado del cliente (browser),
 *     se expone un "mock logger" que no genera errores.
 * ----------------------------------------------------------------------------
 * USO:
 *   - Importar el logger en archivos del servidor: const logger = require('.../logger');
 *   - Llamar logger.error(...), logger.warn(...), logger.info(...), etc.
 *****************************************************************************/

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, simple } = format;
const path = require('path');

const isServer = typeof window === 'undefined';

/**
 * Genera un formato personalizado para los mensajes de log:
 *  - Ejemplo de salida: "2023-06-01 12:34:56 [ERROR]: Ocurrió un problema..."
 */
const customLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

/**
 * FACTORÍA DE LOGGER (solo en servidor)
 * --------------------------------------
 * - Usa formato de timestamp + customLogFormat.
 * - Salida por consola con formato sencillo.
 * - Guarda errores en un archivo 'error.log'.
 * - Nivel de log controlado por variable de entorno LOG_LEVEL (default: 'warn').
 */
function createWinstonLogger() {
  return createLogger({
    level: process.env.LOG_LEVEL || 'warn',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      customLogFormat
    ),
    transports: [
      new transports.Console({
        format: simple(), // Mensajes legibles en consola
      }),
      new transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
      }),
      // Se omite la creación de 'combined.log' para no descargar logs de forma automática
    ],
  });
}

/**
 * MOCK LOGGER (en caso de ejecutarse en el cliente)
 * -------------------------------------------------
 * - Evita errores al importar en el navegador.
 */
const mockLogger = {
  info: () => {},
  debug: () => {},
  warn: () => {},
  error: () => {},
};

// Exporta el logger real si está en el servidor, o un mock en el cliente
module.exports = isServer ? createWinstonLogger() : mockLogger;
