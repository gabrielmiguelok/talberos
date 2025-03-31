/**
 * MIT License
 * -----------
 * Este archivo configura y retorna una conexión a la base de datos MySQL
 * utilizando mysql2/promise. Está diseñado para ser usado exclusivamente en el
 * entorno del servidor (Node.js) en un proyecto Next.js.
 *
 * Nota: Se implementa un temporizador de inactividad para cerrar la conexión
 * automáticamente si no se realizan consultas por un tiempo determinado.
 */

if (typeof window !== 'undefined') {
  throw new Error('db.js debe ser importado solo en el servidor');
}

import mysql from 'mysql2/promise';
import logger from '@utils/logger'; // Ajusta la ruta según tu estructura de proyecto

/**
 * Tiempo de inactividad (en milisegundos) tras el cual la conexión se cerrará.
 */
const INACTIVITY_TIMEOUT_MS = 30000;

/**
 * Crea y retorna una conexión MySQL usando las variables de entorno.
 * Implementa un temporizador para cerrar la conexión en caso de inactividad.
 *
 * @returns {Promise<mysql.Connection>} Conexión activa a la base de datos.
 */
export async function getConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    logger.info('[DB] Conexión establecida con la base de datos.');

    // Temporizador de inactividad
    let inactivityTimer = setTimeout(() => {
      connection.end().catch((err) =>
        logger.error('[DB] Error al cerrar por inactividad:', err)
      );
    }, INACTIVITY_TIMEOUT_MS);

    /**
     * Reinicia el temporizador de inactividad cada vez que se realiza una consulta.
     */
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        connection.end().catch((err) =>
          logger.error('[DB] Error al cerrar por inactividad:', err)
        );
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Sobrescribe métodos query y execute para reiniciar el timer en cada consulta.
    const originalQuery = connection.query.bind(connection);
    connection.query = async (...args) => {
      resetTimer();
      return originalQuery(...args);
    };

    const originalExecute = connection.execute.bind(connection);
    connection.execute = async (...args) => {
      resetTimer();
      return originalExecute(...args);
    };

    return connection;
  } catch (error) {
    logger.error('[DB] Error al conectar a la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}
