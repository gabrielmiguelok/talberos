/**
 * MIT License
 * -----------
 * Endpoint: `/api/activity/registerEvent`
 * Registra eventos de usuario en la base de datos.
 *
 * UBICACIÓN: /api/activity/registerEvent.js
 *
 * FUNCIONALIDAD:
 * - Registra un evento (como clics o interacciones) de un usuario.
 * - Usa los repositorios `UserSessionRepository` y `UserActivityRepository` para obtener
 *   información del usuario y registrar el evento en la base de datos.
 */

import { parseCookies } from '@lib/cookieUtils';
import { getClientIp, getUserAgent, getGeoData } from '@lib/ipService';
import { UserSessionRepository } from '@repositories/UserSessionRepository';
import { UserActivityRepository } from '@repositories/UserActivityRepository';
import { getConnection } from '@lib/db'; // Conexión a la base de datos

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { eventType, busqueda = null } = req.body;
  if (!eventType) {
    return res.status(400).json({ error: 'Falta eventType en el body.' });
  }

  try {
    const cookies = parseCookies(req);
    const authToken = cookies.auth_token;
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const { country, city } = ip.includes('127.') ? {} : getGeoData(ip);

    // Obtenemos el email de la variable de entorno
    const email = process.env.USER_EMAIL || 'anonymous';

    // Usamos el repositorio de actividad para registrar el evento
    const activityRepo = new UserActivityRepository();
    await activityRepo.registerEvent({ email, eventType, busqueda, country, city, ip, userAgent });

    return res.status(200).json({ message: `Evento '${eventType}' registrado correctamente.` });
  } catch (error) {
    console.error('Error en /api/activity/registerEvent:', error);
    return res.status(500).json({ error: 'Error interno al registrar evento.' });
  }
}
