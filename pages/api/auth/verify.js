/**
 * MIT License
 * -----------
 * Este código está diseñado siguiendo principios SOLID y clean code, con un
 * enfoque educativo y didáctico. Se ha separado la lógica en clases y funciones
 * que permiten una mayor cohesión y reducen el acoplamiento, favoreciendo la
 * escalabilidad y la facilidad de mantenimiento.

/**
 * Este archivo define el endpoint `/api/auth/verify`.
 * Verifica la cookie `auth_token`, la busca en la base de datos y
 * retorna la información del usuario si existe.
 */
import { parse, serialize } from 'cookie';
import { getConnection } from '@lib/db'; // Conexión a la base de datos
import mysql from 'mysql2/promise';

/**
 * Clase encargada de gestionar la conexión y consulta necesaria para verificar
 * el token de autenticación del usuario en la base de datos.
 */
class UserSessionVerificationRepository {
  constructor() {
    this.tableName = 'user_sessions'; // Debe coincidir con la tabla usada para las sesiones
  }

  /**
   * Busca en la tabla `user_sessions` el registro cuyo `auth_token` coincida
   * con el token de la cookie. Retorna el usuario si existe o null si no se encuentra.
   *
   * @param {string} authToken - Valor de la cookie de autenticación.
   * @returns {Promise<{ id: number, email: string } | null>} - Objeto con id y email, o null.
   */
  async findByAuthToken(authToken) {
    const connection = await getConnection(); // Obtener conexión desde getConnection()
    const [rows] = await connection.execute(
      `SELECT id, email FROM ${this.tableName} WHERE auth_token = ? LIMIT 1`,
      [authToken]
    );
    await connection.end();

    if (!rows || rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      email: rows[0].email,
    };
  }
}

export default async function handler(req, res) {
  try {
    // LÓGICA DE VERIFICACIÓN SEGÚN COOKIE 'auth_token'
    const cookies = parse(req.headers.cookie || '');
    const authTokenFromCookie = cookies.auth_token || '';

    // Si no existe la cookie, limpiar cookie y retornar error
    if (!authTokenFromCookie) {
      res.setHeader('Set-Cookie', [
        serialize('auth_token', '', {
          path: '/',
          httpOnly: true,
          expires: new Date(0),
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        }),
      ]);
      return res.status(200).json({
        error: 'No existe cookie de autenticación',
        userEmail: null,
      });
    }

    // Busca en la tabla `user_sessions` el registro que coincida con auth_token
    const userSessionVerificationRepo = new UserSessionVerificationRepository();
    const userRecord = await userSessionVerificationRepo.findByAuthToken(authTokenFromCookie);

    // Si no existe registro que coincida, limpiar cookie
    if (!userRecord) {
      res.setHeader('Set-Cookie', [
        serialize('auth_token', '', {
          path: '/',
          httpOnly: true,
          expires: new Date(0),
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        }),
      ]);
      return res.status(200).json({
        error: 'No se encontró sesión asociada a este token',
        userEmail: null,
      });
    }

    // Si existe, retornamos la información correspondiente
    const { id, email } = userRecord;

    return res.status(200).json({
      error: null,
      userId: id,
      userEmail: email,
    });
  } catch (err) {
    console.error('Error en /api/auth/verify:', err);

    // En caso de error, limpiar cookie y retornar JSON
    res.setHeader('Set-Cookie', [
      serialize('auth_token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      }),
    ]);

    return res.status(200).json({
      error: 'Error interno al verificar sesión',
      userEmail: null,
    });
  }
}
