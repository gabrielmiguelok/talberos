import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

// Tema oscuro independiente
const darkTheme = createTheme({
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
 * Layout para Modo Oscuro
 * Encapsula su propio ThemeProvider para aislarlo
 * del tema global.
 */
export default function TalberosLayoutDark({ children }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          // Ajusta el tamaño "chiquito"
          width: { xs: '100%', sm: '400px' },
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
