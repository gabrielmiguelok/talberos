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
 *   Principios SOLID:
 *    - Responsabilidad única: Este toolbar se centra únicamente en la gestión
 *      de filtros (global) y acciones de exportación, refresco, cambio de tema.
 *    - Bajo acoplamiento: Cada acción (descarga, refresco, cambio de tema) es
 *      controlada externamente por callbacks, manteniendo independencia.
 *
 * @version 1.0
 ************************************************************************************/

import React from 'react';
import { IconButton, Tooltip, TextField } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

/**
 * Barra de filtros con búsqueda global y acciones adicionales.
 *
 * @param {object}   props - Props del componente.
 * @param {string}   [props.globalFilterValue=''] - Valor actual del filtro global.
 * @param {Function} props.onGlobalFilterChange   - Callback para manejar el nuevo valor del filtro global.
 * @param {Function} [props.onDownloadExcel]      - Callback para descargar en formato Excel (opcional).
 * @param {Function} [props.onRefresh]           - Callback para refrescar datos (opcional).
 * @param {Function} [props.onThemeToggle]       - Callback para alternar entre modo claro y oscuro (opcional).
 * @param {boolean}  [props.isDarkMode=false]     - Indica si el tema actual es oscuro (true) o claro (false).
 *
 * @returns {JSX.Element} Render del toolbar con sus acciones.
 */
export default function FiltersToolbar({
  globalFilterValue = '',
  onGlobalFilterChange,
  onDownloadExcel,
  onRefresh,
  onThemeToggle,
  isDarkMode = false
}) {
  /**
   * Ejecuta el callback para alternar el tema, si está disponible.
   */
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  /**
   * Estilos generales de la barra de filtros.
   */
  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-filterbar-bg)', // Color de fondo (via CSS variables)
    height: '48px',
    minWidth: '1300px',
    padding: '0 8px',
    gap: '8px',
    boxSizing: 'border-box'
  };

  return (
    <div style={toolbarStyle}>
      {/* Campo de filtro global (TextField) */}
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
              color: 'var(--color-text)' // color de texto (CSS variables)
            }
          }
        }}
      />

      {/* Botón para descargar Excel (opcional) */}
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
            {/* Ícono de descarga (SVG) */}
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

      {/* Botón de modo oscuro/claro (siempre visible) */}
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

      {/* Botón para refrescar datos (opcional) */}
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
