/**
 * MIT License
 * -----------
 * Este código está diseñado siguiendo principios SOLID y clean code, con un
 * enfoque educativo y didáctico. Se ha separado la lógica en clases y funciones
 * que permiten una mayor cohesión y reducen el acoplamiento, favoreciendo la
 * escalabilidad y la facilidad de mantenimiento.
 *
 */

/**
 * Este archivo define el endpoint `/api/auth/logout`.
 * Se encarga de eliminar la cookie `auth_token` (y opcionalmente otras cookies
 * como `userRole`) para cerrar la sesión de usuario.
 */

import { serialize } from 'cookie';

/**
 * Handler principal para el endpoint `/api/auth/logout`.
 * Admite sólo el método POST para realizar el proceso de cierre de sesión,
 * eliminando la(s) cookie(s) que almacena(n) el token de autenticación.
 *
 * @param {import('next').NextApiRequest} req - Objeto Request de Next.js
 * @param {import('next').NextApiResponse} res - Objeto Response de Next.js
 */
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Ajustar según las cookies que quieras eliminar
    res.setHeader('Set-Cookie', [
      serialize('auth_token', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
      }),
      serialize('userRole', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
      }),
    ]);

    return res.status(200).json({ message: 'Desconectado correctamente' });
  }

  // Si no es un método POST, responder con error 405
  return res.status(405).json({ message: `Método ${req.method} no permitido` });
}
