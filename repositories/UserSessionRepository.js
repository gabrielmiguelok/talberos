/**
 * MIT License
 * -----------
 * Repositorio para gestionar la información de las sesiones de usuario.
 * Se conecta con la tabla `user_sessions` en la base de datos y proporciona
 * métodos para obtener y actualizar información sobre las sesiones.
 *
 * Ubicación: /repositories/UserSessionRepository.js
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Cada método realiza una única tarea.
 * - Open/Closed: La clase se extiende sin modificar el código existente.
 * - Separation of Concerns: La lógica de acceso a datos queda encapsulada en este repositorio.
 *
 * Mejores Prácticas:
 * - Uso de async/await para manejo asíncrono.
 * - Uso de un helper para obtener la conexión (con cierre en finally).
 * - Documentación detallada con JSDoc.
 */

import { getConnection } from '@lib/db';

export class UserSessionRepository {
  constructor() {
    this.tableName = 'user_sessions';
  }

  /**
   * Obtiene todas las sesiones de usuario de la base de datos.
   * @returns {Promise<Array>} Una promesa que resuelve con un array de registros.
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

  /**
   * Actualiza la información de ubicación de un usuario en la base de datos.
   * @param {string} email - Correo electrónico del usuario.
   * @param {Object} location - Objeto con datos de ubicación.
   * @param {string} location.ip - Dirección IP del usuario.
   * @param {string} location.country - País del usuario.
   * @param {string} location.city - Ciudad del usuario.
   * @returns {Promise<void>}
   */
  async updateUserLocation(email, { ip, country, city }) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `UPDATE ${this.tableName} SET ip = ?, country = ?, city = ? WHERE email = ?`,
        [ip, country, city, email]
      );
    } finally {
      await connection.end();
    }
  }
}
