import React, { createContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

export const ChatThemeContext = createContext();

export const ChatThemeProvider = ({ children, mode = 'light' }) => {
  // Definimos colores para "light" y "dark"
  const colors = {
    light: {
      primary: '#3B80EE',
      primaryDark: '#327cd4',
      accent: '#128df3',
      secondary: {
        main: '#3fb395',
      },
      background: '#ffffff',
      backgroundSecondary: '#F5F5F5',
      textPrimary: '#000000',
      textSecondary: '#757575',
    },
    dark: {
      primary: '#3B80EE',
      primaryDark: '#327cd4',
      accent: '#128df3',
      secondary: {
        main: '#3fb395',
      },
      background: '#181A20',
      backgroundSecondary: '#242731',
      textPrimary: '#ffffff',
      textSecondary: '#B0B0B0',
    },
  };

  const currentColors = colors[mode] || colors.light;
  const theme = {
    mode,
    colors: currentColors,
    fonts: {
      main: 'Work Sans, Arial, sans-serif',
    },
  };

  // Creamos un theme MUI que use al menos `primary` y `secondary`
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: currentColors.primary,
      },
      secondary: {
        main: currentColors.secondary.main,
      },
    },
    typography: {
      fontFamily: 'Work Sans, Arial, sans-serif',
    },
  });

  return (
    <ChatThemeContext.Provider value={theme}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ChatThemeContext.Provider>
  );
};
