import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

// Tema claro independiente
const lightTheme = createTheme({
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
 * Layout para Modo Claro
 * Encapsula su propio ThemeProvider para aislarlo
 * del tema global. 
 */
export default function TalberosLayoutLight({ children }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          // Ajusta el tamaño "chiquito"
          width: { xs: '100%', sm: '400px' },
          // Margen para separar cada tabla
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}
