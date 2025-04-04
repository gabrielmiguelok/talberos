/************************************************************************************
 * Archivo: /repositories/UserSessionRepository.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Repositorio para gestionar la información de las sesiones de usuario
 *     en la tabla `user_sessions`.
 *   - Permite obtener todas las sesiones y obtener el email basado en el auth_token.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Cada método realiza una única tarea (obtener sesiones, obtener email).
 *   - OCP: Se puede extender sin modificar el núcleo, agregando otros métodos.
 *   - SoC: Separación de la lógica de acceso a la DB.
 *
 ************************************************************************************/

import { getConnection } from '../lib/db'; // Ajusta la ruta a donde tengas tu db.js

export class UserSessionRepository {
  constructor() {
    this.tableName = 'user_sessions';
  }

  /**
   * Obtiene todas las sesiones de usuario de la base de datos.
   * @returns {Promise<Array>} Array de registros con las columnas:
   *  - id, email, google_id, auth_token, first_name, last_name, created_at, updated_at
   */
  async getAllSessions() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(`SELECT * FROM ${this.tableName}`);
      return rows;
    } finally {
      await connection.end();
    }
  }

  /**
   * Obtiene el correo electrónico del usuario basado en su token de autenticación.
   * @param {string} authToken - Token de autenticación (por ejemplo, JWT).
   * @returns {Promise<string|null>} El email del usuario o null si no se encuentra.
   */
  async getEmailByAuthToken(authToken) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT email FROM ${this.tableName} WHERE auth_token = ? LIMIT 1`,
        [authToken]
      );
      return rows[0]?.email || null;
    } finally {
      await connection.end();
    }
  }
}
