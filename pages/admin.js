/************************************************************************************
 * Archivo: /pages/admin.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Página de administración que muestra y edita en línea la tabla `user_sessions`.
 *   - Convierte las fechas `created_at` y `updated_at` a string para evitar
 *     el error de serialización en Next.js.
 *   - Cada fila incluye `rowId` (para el frontend) y `dbId` (para la DB).
 *   - Usa `CustomTable` (edición inline, persistencia local+remota).
 *
 * PRINCIPIOS SOLID APLICADOS:
 * ----------------------------------------------------------------------------------
 *   - SRP: Esta página sólo orquesta SSR + vista. No contiene lógica de DB adicional.
 *   - DIP: Usa `UserSessionRepository` en getServerSideProps, sin acoplar su implementación.
 ************************************************************************************/

import React from 'react';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';

// Menú o navbar
import Menu from '../components/landing/Menu';

// Repositorio
import { UserSessionRepository } from '../repositories/UserSessionRepository';

// Importa tu CustomTable (que tiene la edición inline)
import CustomTable from '../components/CustomTable';

/**
 * Página de administración con edición en línea de `user_sessions`.
 *
 * @param {Object} props
 * @param {Array}  props.sessions  - Filas (con rowId, dbId y fechas a string)
 * @param {string} props.userEmail - Email del usuario autenticado
 */
export default function AdminPage({ sessions, userEmail }) {
  const router = useRouter();

  /**
   * Columnas actuales de la tabla `user_sessions`:
   *  - id, email, google_id, auth_token, first_name, last_name, created_at, updated_at
   */
  const userSessionsColumns = [
    { id: 'id', accessorKey: 'id', header: 'ID', size: 60 },
    { id: 'email', accessorKey: 'email', header: 'Email', size: 220 },
    { id: 'google_id', accessorKey: 'google_id', header: 'Google ID', size: 220 },
    { id: 'auth_token', accessorKey: 'auth_token', header: 'Auth Token', size: 300 },
    { id: 'first_name', accessorKey: 'first_name', header: 'Nombre', size: 120 },
    { id: 'last_name', accessorKey: 'last_name', header: 'Apellido', size: 120 },
    { id: 'created_at', accessorKey: 'created_at', header: 'Creado', size: 160 },
    { id: 'updated_at', accessorKey: 'updated_at', header: 'Actualizado', size: 160 },
  ];

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
                containerHeight="600px"
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
 *  - Verifica la cookie `auth_token`.
 *  - Obtiene email => verifica permisos.
 *  - Consulta `user_sessions` y mapea:
 *    - rowId => índice local (para localStorage y react-table).
 *    - dbId => PK real en la DB (para update remoto).
 *    - created_at / updated_at => convertidas a string con toISOString() o null.
 */
export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.cookies;
  const authToken = cookies.auth_token;

  // [1] Verificar token
  if (!authToken) {
    return {
      redirect: {
        destination: '/api/auth/google',
        permanent: false,
      },
    };
  }

  // [2] Obtener email
  const sessionRepo = new UserSessionRepository();
  let userEmail = null;
  try {
    userEmail = await sessionRepo.getEmailByAuthToken(authToken);
  } catch (error) {
    console.error('Error al obtener email del usuario:', error);
  }

  // [3] Verificar permisos
  const allowedEmails = ['ceo@synara.ar'];
  if (!userEmail || !allowedEmails.includes(userEmail)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // [4] Traer la data de `user_sessions`
  let sessionsRaw = [];
  try {
    sessionsRaw = await sessionRepo.getAllSessions();
  } catch (error) {
    console.error('Error al obtener user_sessions:', error);
  }

  // [5] Mapear cada fila para: rowId, dbId, y convertir fechas a string
  const sessions = sessionsRaw.map((row, index) => ({
    rowId: index,
    dbId: row.id,
    ...row,
    created_at: row.created_at ? row.created_at.toISOString() : null,
    updated_at: row.updated_at ? row.updated_at.toISOString() : null,
  }));

  return {
    props: {
      sessions,
      userEmail,
    },
  };
}
