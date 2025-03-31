/**
 * MIT License
 * -----------------------------------------------------------------------------
 * UBICACIÓN: /lib/ipService.js
 *
 * DESCRIPCIÓN:
 *   - Proporciona funciones utilitarias para obtener la IP, el User-Agent y
 *     datos de geolocalización basados en la base GeoLite2 (offline).
 *   - Hace uso de la librería @maxmind/geoip2-node para convertir la IP en
 *     país (country) y ciudad (city).
 *   - Diseñado siguiendo principios SOLID y Clean Code, evitando mezclar
 *     lógica de negocio. Se limita a la obtención/transformación de datos.
 *
 * PRINCIPIOS SOLID:
 *   - SRP (Single Responsibility Principle):
 *       Este archivo se encarga únicamente de la obtención de la IP y su
 *       geolocalización, sin mezclar otras tareas.
 *   - OCP (Open/Closed Principle):
 *       Es sencillo extender el análisis geográfico (por ejemplo, agregando
 *       región/estado) sin modificar el código central existente.
 *   - LSP, ISP, DIP:
 *       No se utilizan herencias; se exponen funciones con interfaces mínimas.
 *
 *
 * NOTA:
 *   - Este código se asume ejecutado en entorno servidor (Node.js),
 *     pues utiliza 'fs' y '@maxmind/geoip2-node'. No debe importarse en el cliente.
 *   - Para mayor precisión en geolocalización, mantén actualizada la base .mmdb.
 */

import fs from 'fs';
import path from 'path';
import { Reader } from '@maxmind/geoip2-node';

/**
 * Ruta local de la base de datos GeoLite2-City en formato .mmdb.
 * Ajusta según tu estructura de proyecto.
 */
const GEO_DB_PATH = path.join(process.cwd(), 'data', 'geoip.mmdb');

/**
 * Manejador (reader) para la base de datos de geolocalización.
 * Si no se puede cargar, se inicializa como null y getGeoData()
 * retornará datos neutrales { country: null, city: null }.
 */
let geoReader = null;

/**
 * Bloque de inicialización de la base de datos GeoLite2-City:
 * - Lee el archivo geoip.mmdb de forma síncrona.
 * - Si ocurre un error, se registra en consola y geoReader permanece en null.
 */
(function initGeoLite2Database() {
  try {
    const dbBuffer = fs.readFileSync(GEO_DB_PATH);
    geoReader = Reader.openBuffer(dbBuffer);
  } catch (error) {
    console.error(`Error al cargar la base de datos GeoLite2: ${error.message}`);
    geoReader = null;
  }
})();

/**
 * Obtiene la IP del cliente considerando las cabeceras usuales en entornos con proxies
 * o balanceadores de carga. Remueve el prefijo "::ffff:" para direcciones IPv4.
 *
 * @param {import('http').IncomingMessage} req - Objeto Request de Node.js/Next.js
 * @returns {string|null} - IP detectada o null si no se encuentra.
 */
export function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'] || '';
  const xRealIp = req.headers['x-real-ip'] || '';

  let ip = null;
  if (xForwardedFor) {
    ip = xForwardedFor.split(',')[0].trim();
  } else if (xRealIp) {
    ip = xRealIp;
  } else {
    ip = req.socket?.remoteAddress || null;
  }

  // Corrige el formato "::ffff:127.0.0.1" a "127.0.0.1"
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip;
}

/**
 * Obtiene el User-Agent del cliente, tomado de las cabeceras HTTP.
 *
 * @param {import('http').IncomingMessage} req - Objeto Request de Node.js/Next.js
 * @returns {string|null} - User-Agent detectado o null.
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || null;
}

/**
 * Geolocaliza la IP usando la base de datos GeoLite2-City.
 * - Si la IP es local ('127.0.0.1', '::1') o el reader es nulo,
 *   devuelve { country: null, city: null }.
 *
 * @param {string} ip - Dirección IP a geolocalizar
 * @returns {{ country: string|null, city: string|null }} - Datos de geolocalización
 */
export function getGeoData(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { country: null, city: null };
  }

  // Si no se pudo cargar la base de datos, retornar valores nulos.
  if (!geoReader) {
    console.error('[GeoIP] Base de datos no cargada o inválida. Retornando datos nulos.');
    return { country: null, city: null };
  }

  try {
    const response = geoReader.city(ip);
    const country = response.country?.isoCode || null;
    const city = response.city?.names?.en || null;
    return { country, city };
  } catch (error) {
    console.error(`[GeoIP] Error consultando IP '${ip}':`, error);
    return { country: null, city: null };
  }
}
