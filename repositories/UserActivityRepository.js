/**
 * MIT License
 * -----------
 * Repositorio para gestionar la actividad del usuario.
 * Se encarga de interactuar con la tabla `user_activity_logs` para registrar
 * y consultar eventos y vistas de los usuarios.
 *
 * Ubicación: /repositories/UserActivityRepository.js
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: La clase se enfoca en la actividad del usuario.
 * - Open/Closed: Se puede extender sin modificar el código existente.
 * - Separation of Concerns: La lógica de acceso a datos queda encapsulada en este repositorio.
 *
 * Mejores Prácticas:
 * - Uso de async/await para operaciones asíncronas.
 * - Manejo adecuado de la conexión a la base de datos (con cierre en finally).
 * - Documentación detallada mediante JSDoc.
 */

import { getConnection } from '@lib/db';

export class UserActivityRepository {
  constructor() {
    this.tableName = 'user_activity_logs';
  }

  /**
   * Registra un evento de actividad del usuario en la base de datos.
   * @param {Object} activity - Objeto con los detalles del evento.
   * @param {string} activity.email - Correo electrónico del usuario.
   * @param {string} activity.eventType - Tipo de evento (e.g., 'CLICK' o 'VIEW').
   * @param {string} [activity.busqueda] - (Opcional) Texto de búsqueda realizado.
   * @param {string} activity.country - País desde donde se realizó el evento.
   * @param {string} activity.city - Ciudad desde donde se realizó el evento.
   * @param {string} activity.ip - Dirección IP del usuario.
   * @param {string} activity.userAgent - User-Agent del navegador.
   * @returns {Promise<void>}
   */
  async registerEvent({ email, eventType, busqueda = null, country, city, ip, userAgent }) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `INSERT INTO ${this.tableName}
         (email, event_type, process, pais, ciudad, ip, user_agent, busqueda)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?)`,
        [email, eventType, country, city, ip, userAgent, busqueda]
      );
    } finally {
      await connection.end();
    }
  }

  /**
   * Registra una vista de página del usuario en la base de datos.
   * @param {Object} view - Objeto con los detalles de la vista.
   * @param {string} view.email - Correo electrónico del usuario.
   * @param {string} view.country - País desde donde se realizó la vista.
   * @param {string} view.city - Ciudad desde donde se realizó la vista.
   * @param {string} view.ip - Dirección IP del usuario.
   * @param {string} view.userAgent - User-Agent del navegador.
   * @returns {Promise<void>}
   */
  async registerView({ email, country, city, ip, userAgent }) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `INSERT INTO ${this.tableName}
         (email, event_type, process, pais, ciudad, ip, user_agent)
         VALUES (?, 'VIEW', 1, ?, ?, ?, ?)`,
        [email, country, city, ip, userAgent]
      );
    } finally {
      await connection.end();
    }
  }

  /**
   * Obtiene todas las actividades registradas en la base de datos.
   * @returns {Promise<Array>} Una promesa que resuelve con un array de registros.
   */
  async getAllActivities() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(`SELECT * FROM ${this.tableName}`);
      return rows;
    } finally {
      await connection.end();
    }
  }
}
