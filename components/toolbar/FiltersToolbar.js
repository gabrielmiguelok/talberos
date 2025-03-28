/************************************************************************************
 * Archivo: /components/registros/toolbar/FiltersToolbar.js
 * LICENSE: MIT
 *
 * DESCRIPTION:
 *   Barra de filtros genérica con:
 *    - Filtro global (TextField).
 *    - Botón para descargar Excel (opcional).
 *    - Botón para refrescar datos (opcional).
 *    - Botón para cambiar de tema (siempre visible).
 *
 * @version 1.0
 ************************************************************************************/

import React from 'react';
import { IconButton, Tooltip, TextField } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

/**
 * Barra de filtros con búsqueda global y acciones adicionales.
 */
export default function FiltersToolbar({
  globalFilterValue = '',
  onGlobalFilterChange,
  onDownloadExcel,
  onRefresh,
  onThemeToggle,
  isDarkMode = false
}) {
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-filterbar-bg)',
    height: '48px',
    minWidth: '1300px',
    padding: '0 8px',
    gap: '8px',
    boxSizing: 'border-box'
  };

  return (
    <div style={toolbarStyle}>
      {/* Filtro global */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Búsqueda global"
        value={globalFilterValue}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        sx={{
          marginLeft: 'auto',
          width: '220px',
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            minHeight: '30px',
            lineHeight: 1.2,
            '& input': {
              padding: '2px 6px',
              fontSize: '0.8rem',
              color: 'var(--color-text)'
            }
          }
        }}
      />

      {/* Botón para descargar Excel */}
      {onDownloadExcel && (
        <Tooltip title="Descargar datos en formato Excel" arrow>
          <IconButton
            size="small"
            onClick={onDownloadExcel}
            sx={{
              color: isDarkMode ? '#eee' : '#333',
              marginLeft: '4px'
            }}
            aria-label="Descargar Excel"
          >
            <svg
              fill="currentColor"
              height="18"
              width="18"
              viewBox="0 0 24 24"
            >
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18h14v2H5z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Botón modo oscuro/claro */}
      <Tooltip title="Cambiar entre modo claro y oscuro" arrow>
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            color: isDarkMode ? '#eee' : '#555',
            fontSize: '18px'
          }}
          aria-label="Cambiar tema"
        >
          {isDarkMode ? (
            <LightModeIcon fontSize="inherit" />
          ) : (
            <DarkModeIcon fontSize="inherit" />
          )}
        </IconButton>
      </Tooltip>

      {/* Botón refrescar */}
      {onRefresh && (
        <Tooltip title="Refrescar datos" arrow>
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{
              color: isDarkMode ? '#eee' : '#333',
              marginLeft: '4px'
            }}
            aria-label="Refrescar"
          >
            <svg
              fill="currentColor"
              height="18"
              width="18"
              viewBox="0 0 24 24"
            >
              <path d="M13 2v2a7 7 0 0 1 6.935 6.058l1.928-.517A9 9 0 0 0 13 2zm-2 0a9 9 0 0 0-8.863 7.541l1.928.517A7 7 0 0 1 11 4V2zM4.137 14.925l-1.928.517A9 9 0 0 0 11 22v-2a7 7 0 0 1-6.863-5.075zM13 22a9 9 0 0 0 8.863-7.541l-1.928-.517A7 7 0 0 1 13 20v2z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}
