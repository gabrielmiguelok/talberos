/************************************************************************************
 * Archivo: /components/TableView/subcomponents/LoadingOverlay.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza un overlay con un spinner y texto cuando la tabla está en modo "cargando".
 *
 * SRP:
 *  - Único propósito: mostrar la UI de carga.
 *
 ************************************************************************************/

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingOverlay
 * @param {string} loadingText - Texto a mostrar junto al spinner
 */
export default function LoadingOverlay({ loadingText }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        padding: '32px',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--color-bg-paper)',
        zIndex: 9999,
      }}
    >
      <CircularProgress sx={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        {loadingText}
      </Typography>
    </Box>
  );
}
