/************************************************************************************
 * lib/cookieUtils.js
 * Descripción:
 *   - Funciones utilitarias para parsear cookies de forma segura y DRY.
 ************************************************************************************/

/**
 * Parsea las cookies de la cabecera "cookie".
 * @param {object} req - Objeto de petición Next.js con headers
 * @returns {Record<string, string>} Objeto { cookieName: value }
 */
export function parseCookies(req) {
  const rawCookie = req.headers?.cookie || '';
  return rawCookie.split(';').reduce((acc, item) => {
    const [key, val] = item.trim().split('=');
    if (key && val) {
      acc[key] = decodeURIComponent(val);
    }
    return acc;
  }, {});
}
