/************************************************************************************
 * Archivo: /components/TableView/subcomponents/NoResultsOverlay.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza un overlay para indicar que no hay resultados en la tabla.
 *
 * SRP:
 *  - Único propósito: mostrar la UI de "sin resultados".
 *
 ************************************************************************************/

import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * NoResultsOverlay
 * @param {string} noResultsText - Texto a mostrar cuando no hay filas
 */
export default function NoResultsOverlay({ noResultsText }) {
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
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
        {noResultsText}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Modifica los filtros o la búsqueda para ver más resultados.
      </Typography>
    </Box>
  );
}
