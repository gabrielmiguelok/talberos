import React from 'react';
import Head from 'next/head';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';
import CustomTable from '../components/CustomTable';
import Menu from '../components/landing/Menu';
import { UserSessionRepository } from '@repositories/UserSessionRepository';
import { UserActivityRepository } from '@repositories/UserActivityRepository';

/**
 * Página de administración.
 * Esta versión utiliza getServerSideProps para:
 *  - Verificar la autenticación del usuario mediante la cookie auth_token.
 *  - Obtener el email y validar que el usuario esté autorizado.
 *  - Consultar las tablas user_sessions y user_activity_logs.
 *
 * Se conserva la estética original con fondo oscuro, tipografía blanca y disposición flexible.
 *
 * @param {Object} props
 * @param {Array} props.sessions - Registros de la tabla user_sessions.
 * @param {Array} props.activities - Registros de la tabla user_activity_logs.
 * @param {string} props.userEmail - Email del usuario autenticado.
 */
function AdminPage({ sessions, activities, userEmail }) {
  const router = useRouter();

  // Columnas definidas para la tabla user_sessions
  const userSessionsColumns = [
    { id: 'id', accessorKey: 'id', header: 'ID', size: 60 },
    { id: 'email', accessorKey: 'email', header: 'Email', size: 220 },
    { id: 'google_id', accessorKey: 'google_id', header: 'Google ID', size: 220 },
    { id: 'auth_token', accessorKey: 'auth_token', header: 'Auth Token', size: 300 },
    { id: 'first_name', accessorKey: 'first_name', header: 'Nombre', size: 120 },
    { id: 'last_name', accessorKey: 'last_name', header: 'Apellido', size: 120 },
    { id: 'ip', accessorKey: 'ip', header: 'IP', size: 130 },
    { id: 'country', accessorKey: 'country', header: 'País', size: 110 },
    { id: 'city', accessorKey: 'city', header: 'Ciudad', size: 110 },
    { id: 'created_at', accessorKey: 'created_at', header: 'Creado', size: 160 },
    { id: 'updated_at', accessorKey: 'updated_at', header: 'Actualizado', size: 160 },
  ];

  // Columnas definidas para la tabla user_activity_logs
  const userActivitiesColumns = [
    { id: 'id', accessorKey: 'id', header: 'ID', size: 60 },
    { id: 'email', accessorKey: 'email', header: 'Email', size: 220 },
    { id: 'event_type', accessorKey: 'event_type', header: 'Evento', size: 140 },
    { id: 'process', accessorKey: 'process', header: 'Proceso', size: 100 },
    { id: 'busqueda', accessorKey: 'busqueda', header: 'Búsqueda', size: 160 },
    { id: 'pais', accessorKey: 'pais', header: 'País', size: 110 },
    { id: 'ciudad', accessorKey: 'ciudad', header: 'Ciudad', size: 110 },
    { id: 'ip', accessorKey: 'ip', header: 'IP', size: 130 },
    { id: 'user_agent', accessorKey: 'user_agent', header: 'User-Agent', size: 250 },
    { id: 'created_at', accessorKey: 'created_at', header: 'Creado', size: 160 },
  ];

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Panel de administración</title>
      </Head>
      <Menu />
      <Box
        sx={{
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#121212',
          color: '#FFF',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 4,
            px: { xs: 2, md: 6 },
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ color: '#FF00AA' }}>
            Panel de administración
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 4 }}>
            <Box sx={{ flex: 1, minWidth: 500 }}>
              <CustomTable
                data={sessions}
                columnsDef={userSessionsColumns}
                themeMode="dark"
                containerHeight="400px"
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 500 }}>
              <CustomTable
                data={activities}
                columnsDef={userActivitiesColumns}
                themeMode="dark"
                containerHeight="400px"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

/**
 * getServerSideProps:
 *  - Verifica la existencia de la cookie 'auth_token'.
 *  - Obtiene el email del usuario mediante UserSessionRepository.
 *  - Valida que el usuario esté autorizado (lista de emails permitidos).
 *  - Consulta los datos de las tablas user_sessions y user_activity_logs.
 *
 * En caso de no cumplir alguna condición, redirige al usuario a la página de login o home.
 */
export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.cookies;
  const authToken = cookies.auth_token;

  // Si no existe el token, redirigir al login.
  if (!authToken) {
    return {
      redirect: {
        destination: '/api/auth/google',
        permanent: false,
      },
    };
  }

  // Instanciar el repositorio para obtener el email del usuario.
  const sessionRepo = new UserSessionRepository();
  let userEmail = null;
  try {
    userEmail = await sessionRepo.getEmailByAuthToken(authToken);
  } catch (error) {
    console.error('Error al obtener email del usuario:', error);
  }

  // Lista de emails autorizados.
  const allowedEmails = ['ceo@synara.ar'];
  if (!userEmail || !allowedEmails.includes(userEmail)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Obtener datos de las tablas.
  let sessions = [];
  let activities = [];
  try {
    sessions = await sessionRepo.getAllSessions();
  } catch (error) {
    console.error('Error al obtener user_sessions:', error);
  }
  try {
    const activityRepo = new UserActivityRepository();
    activities = await activityRepo.getAllActivities();
  } catch (error) {
    console.error('Error al obtener user_activity_logs:', error);
  }

  return {
    props: {
      sessions,
      activities,
      userEmail,
    },
  };
}

export default AdminPage;
