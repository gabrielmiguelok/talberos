/**
 * Archivo: ./layouts/TalberosLayoutLight.js
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *   - Layout que provee un ThemeProvider con modo claro (light) por defecto.
 *   - Permite inyectar opciones de tema adicionales vía props, sin romper
 *     el comportamiento si no se reciben.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Se encarga de proveer el tema claro y encerrar el contenido con <ThemeProvider>.
 *   - OCP: El tema se extiende mediante props `themeOptions`.
 */

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * @typedef TalberosLayoutLightProps
 * @property {React.ReactNode} children - Contenido (componentes) que se renderizarán dentro del layout.
 * @property {object} [themeOptions] - Opciones adicionales para extender/mezclar con el tema claro por defecto.
 * @property {object} [boxProps] - Props adicionales para el contenedor <Box>.
 */

/** Tema claro base (por defecto) */
const baseLightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2D9CDB',
    },
    background: {
      default: '#F7F7F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333',
    },
  },
});

/**
 * Mezcla el tema base con `themeOptions` proporcionadas.
 * @param {object} [themeOptions={}] Opciones de tema adicionales
 * @returns {object} Objeto de tema resultante
 */
function mergeLightTheme(themeOptions = {}) {
  return createTheme({
    ...baseLightTheme,
    ...themeOptions,
    palette: {
      ...baseLightTheme.palette,
      ...(themeOptions?.palette || {}),
    },
  });
}

/**
 * TalberosLayoutLight
 * -------------------------------------------------------------------------
 * Layout para Modo Claro. Encapsula su propio ThemeProvider para aislarlo
 * del tema global y permite inyectar nuevas configuraciones vía props.
 *
 * @param {TalberosLayoutLightProps} props - Props del layout
 * @returns {JSX.Element}
 */
export default function TalberosLayoutLight({
  children,
  themeOptions = {},
  boxProps = {},
}) {
  // 1) Mezclamos el tema base con las opciones proporcionadas
  const mergedLightTheme = mergeLightTheme(themeOptions);

  // 2) Renderizamos el ThemeProvider y el contenedor Box
  return (
    <ThemeProvider theme={mergedLightTheme}>
      <Box
        sx={{
          // Ajusta el tamaño "chiquito"
          width: { xs: '100%', sm: '400px' },
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          ...boxProps.sx,
        }}
        {...boxProps}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}
