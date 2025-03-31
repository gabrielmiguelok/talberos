/**
 * MIT License
 * -----------
 * Este código está diseñado siguiendo principios SOLID y clean code, con un
 * enfoque educativo y didáctico. Se ha separado la lógica en clases y funciones
 * que permiten una mayor cohesión y reducen el acoplamiento, favoreciendo la
 * escalabilidad y la facilidad de mantenimiento.
 *
 */

import { google } from 'googleapis';
import mysql from 'mysql2/promise';
import { serialize } from 'cookie';
import crypto from 'crypto';

/**
 * Determina si la aplicación se está ejecutando en modo de producción.
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Clase encargada de la configuración y flujo de autenticación con Google.
 * Asegura la correcta obtención y verificación de tokens, así como
 * la adquisición de información de usuario.
 */
class GoogleAuthService {
  /**
   * Crea una instancia del servicio de autenticación con Google.
   * @param {string} clientId - ID de cliente de Google OAuth.
   * @param {string} clientSecret - Secreto de cliente de Google OAuth.
   * @param {string} redirectUri - URI de redirección establecida en Google Developer Console.
   */
  constructor(clientId, clientSecret, redirectUri) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Genera la URL de autenticación de Google con los parámetros necesarios.
   * @returns {string} - URL para redirigir al usuario y solicitar consentimiento.
   */
  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'consent',
    });
  }

  /**
   * Intercambia el código de autorización por los tokens de acceso y actualiza
   * las credenciales del cliente OAuth2.
   * @param {string} code - Código temporal de Google OAuth.
   * @returns {Promise<void>}
   */
  async getTokensAndSetCredentials(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Obtiene la información básica del perfil de Google del usuario autenticado.
   * @returns {Promise<{ email: string, given_name: string, family_name: string, id: string }>}
   */
  async getUserInfo() {
    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();
    return data;
  }
}

/**
 * Clase encargada de manejar todas las operaciones de la base de datos
 * relacionadas con la sesión de usuarios.
 */
class UserSessionRepository {
  /**
   * Inicializa el repositorio con los datos de conexión a la base de datos.
   * No se realiza la conexión inmediatamente para mantener bajo acoplamiento.
   */
  constructor() {
    this.host = process.env.DB_HOST;
    this.user = process.env.DB_USER;
    this.password = process.env.DB_PASSWORD;
    this.database = process.env.DB_NAME;
    this.tableName = 'user_sessions'; // Renombra la tabla de acuerdo a tus necesidades
  }

  /**
   * Crea y retorna una conexión a la base de datos usando los parámetros
   * definidos en el constructor.
   * @returns {Promise<mysql.Connection>} - Conexión a la base de datos.
   */
  async createConnection() {
    return mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.database,
    });
  }

  /**
   * Asegura que la tabla "user_sessions" exista en la base de datos.
   * Si no existe, la crea con la estructura definida.
   *
   * @param {mysql.Connection} connection - Conexión activa a la base de datos.
   */
  async initializeUserSessionsTable(connection) {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
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
    await connection.execute(query);
  }

  /**
   * Verifica si existe un registro para un usuario con el email proporcionado.
   * @param {mysql.Connection} connection - Conexión activa a la base de datos.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<boolean>} - Retorna true si existe, false en caso contrario.
   */
  async userExists(connection, email) {
    const [rows] = await connection.execute(
      `SELECT id FROM ${this.tableName} WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows.length > 0;
  }

  /**
   * Crea un nuevo registro para un usuario en la tabla "user_sessions".
   * @param {mysql.Connection} connection - Conexión activa a la base de datos.
   * @param {Object} userData - Datos del usuario.
   * @param {string} userData.email - Correo electrónico.
   * @param {string} userData.googleId - ID de Google.
   * @param {string} userData.authToken - Token de autenticación generado.
   * @param {string} userData.firstName - Nombre del usuario.
   * @param {string} userData.lastName - Apellido del usuario.
   */
  async createUserSession(connection, { email, googleId, authToken, firstName, lastName }) {
    await connection.execute(
      `INSERT INTO ${this.tableName} (email, google_id, auth_token, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [email, googleId, authToken, firstName, lastName]
    );
  }

  /**
   * Actualiza el registro de un usuario existente en la tabla "user_sessions".
   * @param {mysql.Connection} connection - Conexión activa a la base de datos.
   * @param {Object} userData - Datos del usuario.
   * @param {string} userData.email - Correo electrónico.
   * @param {string} userData.googleId - ID de Google.
   * @param {string} userData.authToken - Token de autenticación generado.
   * @param {string} userData.firstName - Nombre del usuario.
   * @param {string} userData.lastName - Apellido del usuario.
   */
  async updateUserSession(connection, { email, googleId, authToken, firstName, lastName }) {
    await connection.execute(
      `UPDATE ${this.tableName}
         SET google_id = ?,
             auth_token = ?,
             first_name = ?,
             last_name = ?
       WHERE email = ?`,
      [googleId, authToken, firstName, lastName, email]
    );
  }
}

/**
 * Handler principal para la autenticación con Google en Next.js.
 * Encargado de redirigir al flujo de autenticación o manejar el callback
 * para crear/actualizar la sesión de usuario en la base de datos y
 * configurar la cookie de sesión.
 *
 * @param {import('next').NextApiRequest} req - Objeto Request de Next.js
 * @param {import('next').NextApiResponse} res - Objeto Response de Next.js
 */
export default async function handler(req, res) {
  const { code } = req.query;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`;

  // Instanciar servicio de autenticación de Google
  const googleAuthService = new GoogleAuthService(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // Si no se recibe un "code", iniciar el flujo de autenticación con Google
  if (!code) {
    const authUrl = googleAuthService.generateAuthUrl();
    return res.redirect(authUrl);
  }

  try {
    // Obtener tokens y credenciales con el "code" proporcionado
    await googleAuthService.getTokensAndSetCredentials(code);

    // Obtener información básica del usuario
    const userInfo = await googleAuthService.getUserInfo();
    const { email, given_name: firstName, family_name: lastName, id: googleId } = userInfo;

    // Instanciar repositorio de sesiones de usuario
    const userSessionRepository = new UserSessionRepository();

    // Conectar a la base de datos
    const connection = await userSessionRepository.createConnection();

    // Asegurar que la tabla "user_sessions" exista
    await userSessionRepository.initializeUserSessionsTable(connection);

    // Generar un token aleatorio para la cookie (auth_token)
    const authToken = crypto.randomBytes(64).toString('hex');

    // Verificar si el usuario existe
    const userAlreadyExists = await userSessionRepository.userExists(connection, email);

    if (!userAlreadyExists) {
      // Crear nuevo registro para el usuario
      await userSessionRepository.createUserSession(connection, {
        email,
        googleId,
        authToken,
        firstName,
        lastName,
      });
    } else {
      // Actualizar la sesión del usuario
      await userSessionRepository.updateUserSession(connection, {
        email,
        googleId,
        authToken,
        firstName,
        lastName,
      });
    }

    // Configurar la cookie de autenticación
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    };

    const serializedCookie = serialize('auth_token', authToken, cookieOptions);
    res.setHeader('Set-Cookie', serializedCookie);

    // Cerrar la conexión a la base de datos
    await connection.end();

    // Redirigir a la página de administración (o la ruta que desees)
    res.writeHead(302, { Location: '/admin' });
    res.end();
  } catch (error) {
    console.error('Error durante la autenticación con Google:', error);
    return res.status(500).send('Error al autenticar con Google');
  }
}
