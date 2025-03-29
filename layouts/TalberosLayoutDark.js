/**
 * Archivo: ./layouts/TalberosLayoutDark.js
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *   - Layout que provee un ThemeProvider con modo oscuro por defecto.
 *   - Permite inyectar opciones de tema adicionales vía props, sin romper
 *     el comportamiento si no se reciben.
 *
 * PRINCIPIOS SOLID:
 *   - SRP (Single Responsibility Principle): Se encarga únicamente de proveer
 *     un tema oscuro (u opciones extendidas) y encerrar el contenido (children) con <ThemeProvider>.
 *   - OCP (Open-Closed Principle): El tema se puede extender/editar mediante props
 *     sin modificar el layout internamente.
 */

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * @typedef TalberosLayoutDarkProps
 * @property {React.ReactNode} children - Contenido (componentes) que se renderizarán dentro del layout.
 * @property {object} [themeOptions] - Opciones adicionales para extender/mezclar con el tema oscuro por defecto.
 * @property {object} [boxProps] - Props adicionales para el contenedor <Box>, p. ej. estilos en línea.
 */

/** Tema oscuro base (por defecto) */
const baseDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1F1F1F',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

/**
 * Mezcla el tema base con `themeOptions` proporcionadas,
 * retornando un nuevo objeto de tema.
 * @param {object} [themeOptions={}] Opciones de tema adicionales
 * @returns {object} Objeto de tema resultante
 */
function mergeDarkTheme(themeOptions = {}) {
  return createTheme({
    ...baseDarkTheme,
    ...themeOptions,
    // Mezclar parcial, si palette está en themeOptions, la sobreescribimos:
    palette: {
      ...baseDarkTheme.palette,
      ...(themeOptions?.palette || {}),
    },
  });
}

/**
 * TalberosLayoutDark
 * -------------------------------------------------------------------------
 * Layout para Modo Oscuro. Encapsula su propio ThemeProvider para aislarlo
 * del tema global y permite inyectar nuevas configuraciones vía props.
 *
 * @param {TalberosLayoutDarkProps} props - Props del layout
 * @returns {JSX.Element}
 */
export default function TalberosLayoutDark({
  children,
  themeOptions = {},
  boxProps = {},
}) {
  // 1) Mezclamos el tema base con las opciones proporcionadas
  const mergedDarkTheme = mergeDarkTheme(themeOptions);

  // 2) Renderizamos el ThemeProvider y el contenedor Box
  return (
    <ThemeProvider theme={mergedDarkTheme}>
      <Box
        sx={{
          width: { xs: '100%', sm: '400px' }, // Ajuste "chiquito" por defecto
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          ...boxProps.sx, // si el usuario pasa sx adicional, lo fusionamos
        }}
        {...boxProps} // Pasamos el resto de props del Box (ej: id, className, etc.)
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}
