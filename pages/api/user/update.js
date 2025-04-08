/************************************************************************************
 * Archivo: /api/user/updatejs
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Endpoint de ejemplo (Next.js) para recibir la actualización de un campo en la DB.
 *   - Espera { id, field, value } en el body de la request POST.
 *   - Actualiza la tabla "user_subscription" en MariaDB.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Se encarga únicamente de actualizar un campo en la DB.
 *   - DIP: No depende directamente de la UI. Solo expone un contrato {id, field, value}.
 ************************************************************************************/

import { createConnection } from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, field, value } = req.body;
  if (!id || !field) {
    return res.status(400).json({ error: 'Faltan parámetros (id, field, value)' });
  }

  try {
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // IMPORTANTE: si 'field' viene del usuario, haz un mapeo/validación más robusta
    // para evitar SQL injection o nombres de columnas inválidos.
    const [result] = await connection.execute(
      `
       UPDATE user_sessions
       SET \`${field}\` = ?
       WHERE id = ?
      `,
      [value, id]
    );

    await connection.end();
    return res.json({
      success: true,
      affectedRows: result.affectedRows,
      message: 'Campo actualizado correctamente',
    });
  } catch (err) {
    console.error('Error en /api/user/updatejs:', err);
    return res.status(500).json({ error: 'Error actualizando la suscripción' });
  }
}
