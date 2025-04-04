/**
 * =============================================================================
 * Licencia MIT
 * -----------
 * Se concede permiso, libre de cargo, a cualquier persona que obtenga una copia
 * de este software y de los archivos de documentación asociados (el "Software"),
 * para tratar en el Software sin restricción, incluyendo sin limitación los
 * derechos de usar, copiar, modificar, fusionar, publicar, distribuir,
 * sublicenciar y/o vender copias del Software, y para permitir a las personas
 * a quienes se les proporcione el Software que lo hagan, sujeto a las siguientes
 * condiciones:
 *
 * El aviso de copyright anterior y este aviso de permiso se incluirán en todas
 * las copias o partes sustanciales del Software.
 *
 * EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA
 * O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIABILIDAD,
 * IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS
 * AUTORES O TITULARES DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA
 * RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN CONTRACTUAL,
 * AGRAVIO O DE OTRA MANERA, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE O EL
 * USO U OTROS TRATOS EN EL SOFTWARE.
 * =============================================================================
 *
 * Repositorio para administrar la persistencia de sesiones de usuario
 * en la base de datos. Cumple con SRP al enfocarse exclusivamente en
 * operaciones relacionadas con 'user_sessions'.
 */

import mysql from 'mysql2/promise';

/**
 * Clase que encapsula la comunicación con la tabla "user_sessions" en la base
 * de datos, siguiendo principios de bajo acoplamiento y alta cohesión.
 */
export default class RepositorioSesionesUsuario {
  /**
   * Inicializa los datos de conexión a la base de datos sin establecerla
   * inmediatamente (respetando el principio de no hacer más de lo necesario).
   */
  constructor() {
    this.host = process.env.DB_HOST;
    this.user = process.env.DB_USER;
    this.password = process.env.DB_PASSWORD;
    this.database = process.env.DB_NAME;

    /**
     * Puedes cambiar el nombre de la tabla según tus necesidades.
     * Se aconseja que sea algo autoexplicativo.
     */
    this.nombreTabla = 'user_sessions';
  }

  /**
   * Crea y retorna una conexión a la base de datos mediante mysql2/promise.
   * @returns {Promise<mysql.Connection>} Conexión activa a la base de datos.
   */
  async crearConexion() {
    return mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.database,
    });
  }

  /**
   * Crea la tabla de sesiones de usuario si no existe, asegurando que
   * la estructura se mantenga con los campos requeridos.
   *
   * @param {mysql.Connection} conexion - Conexión activa a la base de datos.
   * @returns {Promise<void>}
   */
  async asegurarTablaSesiones(conexion) {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.nombreTabla} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        google_id VARCHAR(255) NOT NULL,
        auth_token VARCHAR(128) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await conexion.execute(query);
  }

  /**
   * Verifica si existe un usuario con el correo electrónico especificado.
   *
   * @param {mysql.Connection} conexion - Conexión activa a la base de datos.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<boolean>} Retorna `true` si el usuario existe, `false` si no.
   */
  async existeUsuario(conexion, email) {
    const [filas] = await conexion.execute(
      `SELECT id FROM ${this.nombreTabla} WHERE email = ? LIMIT 1`,
      [email]
    );
    return filas.length > 0;
  }

  /**
   * Crea un nuevo registro de sesión para el usuario. Se utiliza cuando es
   * la primera vez que el usuario se autentica.
   *
   * @param {mysql.Connection} conexion - Conexión activa a la base de datos.
   * @param {Object} datosUsuario - Datos del usuario.
   * @param {string} datosUsuario.email - Correo electrónico.
   * @param {string} datosUsuario.googleId - ID de Google.
   * @param {string} datosUsuario.authToken - Token de autenticación.
   * @param {string} datosUsuario.firstName - Nombre del usuario.
   * @param {string} datosUsuario.lastName - Apellido del usuario.
   * @returns {Promise<void>}
   */
  async crearSesionUsuario(conexion, { email, googleId, authToken, firstName, lastName }) {
    await conexion.execute(
      `INSERT INTO ${this.nombreTabla} (email, google_id, auth_token, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [email, googleId, authToken, firstName, lastName]
    );
  }

  /**
   * Actualiza el registro de sesión de un usuario existente. **En este caso,
   * NO se actualiza el nombre ni el apellido**, según la decisión de negocio
   * de mantenerlos solo la primera vez.
   *
   * @param {mysql.Connection} conexion - Conexión activa a la base de datos.
   * @param {Object} datosUsuario - Datos del usuario.
   * @param {string} datosUsuario.email - Correo electrónico.
   * @param {string} datosUsuario.googleId - ID de Google.
   * @param {string} datosUsuario.authToken - Token de autenticación.
   * @returns {Promise<void>}
   */
  async actualizarSesionUsuario(conexion, { email, googleId, authToken }) {
    await conexion.execute(
      `UPDATE ${this.nombreTabla}
         SET google_id = ?,
             auth_token = ?
       WHERE email = ?`,
      [googleId, authToken, email]
    );
  }
}
