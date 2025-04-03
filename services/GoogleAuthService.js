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
 * Servicio para la autenticación con Google mediante OAuth 2.0.
 * Sigue principios SOLID y Clean Code, facilitando la inyección
 * de dependencias y la extensión futura sin modificar el núcleo.
 */

import { google } from 'googleapis';

/**
 * Determina si la aplicación se está ejecutando en modo de producción.
 * Puede ser útil para configurar ciertos parámetros de seguridad.
 * @type {boolean}
 */
const esProduccion = process.env.NODE_ENV === 'production';

/**
 * Servicio especializado en el flujo de autenticación con Google OAuth.
 * Responsable de crear la URL de autorización, intercambiar códigos por tokens
 * y obtener la información básica del usuario.
 */
export default class ServicioGoogleAuth {
  /**
   * Constructor para inicializar la instancia de OAuth2 con los datos
   * de configuración proporcionados.
   *
   * @param {string} clientId - ID de cliente de Google OAuth.
   * @param {string} clientSecret - Secreto de cliente de Google OAuth.
   * @param {string} redirectUri - URI de redirección (registrada en Google Developer Console).
   */
  constructor(clientId, clientSecret, redirectUri) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Genera la URL de autenticación de Google con los parámetros necesarios.
   * Permite al usuario otorgar acceso a su información de correo y perfil.
   *
   * @returns {string} URL para redirigir al usuario y solicitar consentimiento.
   */
  generarUrlDeAutorizacion() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'consent',
    });
  }

  /**
   * Intercambia el código temporal de autorización por tokens de acceso y
   * actualiza las credenciales del cliente OAuth2 interno.
   *
   * @param {string} code - Código temporal devuelto por Google OAuth.
   * @returns {Promise<void>}
   */
  async obtenerTokensYConfigurarCredenciales(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Obtiene la información básica (email, nombre, apellido, id de Google) del
   * usuario autenticado.
   *
   * @returns {Promise<{ email: string, given_name: string, family_name: string, id: string }>}
   */
  async obtenerInfoUsuario() {
    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();
    return data;
  }

  /**
   * Indica si la aplicación está en producción o no.
   * Puede ser utilizado por otros servicios si es necesario.
   *
   * @returns {boolean} Valor que indica si estamos en modo de producción.
   */
  esEntornoProduccion() {
    return esProduccion;
  }
}
