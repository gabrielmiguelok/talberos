'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatThemeProvider.js
 *
 * DESCRIPCIÓN:
 *   - Provee un tema de Material UI para el chatbot (o la app) con una paleta
 *     principal y secundaria. Facilita la personalización global.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Solo maneja la creación y provisión del tema MUI.
 *   - OCP: Se pueden agregar más configuraciones sin modificar la lógica existente.
 *
 * -----------------------------------------------------------------------------
 */

import React, { createContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE PALETA
   -------------------------------------------------------------------------- */
const PRIMARY_MAIN = '#FF00AA';
const PRIMARY_DARK = '#E60099';
const SECONDARY_MAIN = '#1F1F1F';

/* --------------------------------------------------------------------------
   2) CONTEXTO Y PROVEEDOR DE TEMA
   -------------------------------------------------------------------------- */
export const ChatThemeContext = createContext();

export function ChatThemeProvider({ children }) {
  const muiTheme = createTheme({
    palette: {
      primary: {
        main: PRIMARY_MAIN,
        dark: PRIMARY_DARK,
      },
      secondary: {
        main: SECONDARY_MAIN,
      },
    },
    typography: {
      fontFamily: ['Work Sans', 'Arial', 'sans-serif'].join(','),
      body1: {
        fontSize: '0.95rem',
      },
      button: {
        textTransform: 'none',
      },
    },
  });

  return (
    <ChatThemeContext.Provider value={muiTheme}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ChatThemeContext.Provider>
  );
}
