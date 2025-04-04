/************************************************************************************
 * Archivo: /lib/db.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Configura y retorna una conexión a MySQL/MariaDB usando mysql2/promise.
 *   - Incluye un temporizador de inactividad para cerrar la conexión si no se usa.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Maneja la conexión a la BD, sin mezclar otra lógica.
 *
 ************************************************************************************/

import mysql from 'mysql2/promise';
import logger from '../utils/logger'; // Ajusta la ruta o quita si no usas logger

const INACTIVITY_TIMEOUT_MS = 30000;

export async function getConnection() {
  if (typeof window !== 'undefined') {
    throw new Error('db.js debe ser importado solo en el servidor');
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    logger?.info?.('[DB] Conexión establecida con la base de datos.');

    let inactivityTimer = setTimeout(() => {
      connection
        .end()
        .catch((err) => logger?.error?.('[DB] Error al cerrar por inactividad:', err));
    }, INACTIVITY_TIMEOUT_MS);

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        connection
          .end()
          .catch((err) => logger?.error?.('[DB] Error al cerrar por inactividad:', err));
      }, INACTIVITY_TIMEOUT_MS);
    };

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
    logger?.error?.('[DB] Error al conectar a la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}
