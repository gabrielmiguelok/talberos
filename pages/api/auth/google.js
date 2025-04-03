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
 * Punto de entrada para manejar la autenticación con Google en una
 * aplicación Next.js. Aplica los servicios y repositorios de manera
 * desacoplada, siguiendo los principios de SRP, SoC y DIP.
 */

import { serialize } from 'cookie';
import crypto from 'crypto';
import ServicioGoogleAuth from '../../../services/GoogleAuthService';
import RepositorioSesionesUsuario from '../../../repositories/RepositorioSesionesUsuario';

/**
 * Función manejadora de la ruta `/api/auth/google`.
 * Realiza las siguientes operaciones:
 * 1. Si no hay "code" en la query, redirige a la URL de autorización de Google.
 * 2. Si hay "code", intercambia por tokens, obtiene la info del usuario,
 *    crea o actualiza (sin modificar nombre/apellido si ya existe) el registro
 *    en la base de datos, y setea una cookie de sesión.
 *
 * @param {import('next').NextApiRequest} req - Objeto de solicitud HTTP.
 * @param {import('next').NextApiResponse} res - Objeto de respuesta HTTP.
 */
export default async function handler(req, res) {
  const { code } = req.query;

  // Construimos la URL de retorno dinámicamente
  const urlRetorno = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`;

  // Instanciamos el servicio de autenticación con Google
  const servicioGoogle = new ServicioGoogleAuth(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    urlRetorno
  );

  // Si no se recibió "code", iniciamos el flujo de autenticación
  if (!code) {
    const urlAuth = servicioGoogle.generarUrlDeAutorizacion();
    return res.redirect(urlAuth);
  }

  try {
    // Intercambiamos el "code" por tokens y los configuramos en el cliente OAuth
    await servicioGoogle.obtenerTokensYConfigurarCredenciales(code);

    // Obtenemos la información básica del usuario autenticado en Google
    const userInfo = await servicioGoogle.obtenerInfoUsuario();
    const { email, given_name: firstName, family_name: lastName, id: googleId } = userInfo;

    // Instanciamos el repositorio responsable de manejar la persistencia
    const repoSesiones = new RepositorioSesionesUsuario();

    // Creamos la conexión a la base de datos
    const conexion = await repoSesiones.crearConexion();

    // Aseguramos que la tabla de sesiones exista
    await repoSesiones.asegurarTablaSesiones(conexion);

    // Generamos un token aleatorio que usaremos como "auth_token"
    const authToken = crypto.randomBytes(64).toString('hex');

    // Verificamos si el usuario ya está registrado
    const usuarioExiste = await repoSesiones.existeUsuario(conexion, email);

    if (!usuarioExiste) {
      // Creamos un nuevo registro con nombre y apellido
      await repoSesiones.crearSesionUsuario(conexion, {
        email,
        googleId,
        authToken,
        firstName,
        lastName,
      });
    } else {
      // Solo actualizamos los campos de Google ID y authToken.
      // El nombre y el apellido NO se actualizan si ya existía.
      await repoSesiones.actualizarSesionUsuario(conexion, {
        email,
        googleId,
        authToken,
      });
    }

    // Configuramos la cookie "auth_token"
    const opcionesCookie = {
      path: '/',
      httpOnly: true,
      secure: servicioGoogle.esEntornoProduccion(),
      sameSite: servicioGoogle.esEntornoProduccion() ? 'none' : 'lax',
    };

    const cookieSerializada = serialize('auth_token', authToken, opcionesCookie);
    res.setHeader('Set-Cookie', cookieSerializada);

    // Cerramos la conexión a la base de datos
    await conexion.end();

    // Redirigimos a la página de administración o a donde necesites
    res.writeHead(302, { Location: '/admin' });
    res.end();
  } catch (error) {
    console.error('Error durante la autenticación con Google:', error);
    return res.status(500).send('Error al autenticar con Google');
  }
}
