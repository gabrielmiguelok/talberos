/************************************************************************************
 * Archivo: /components/registros/toolbar/FiltersToolbar.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   Barra de filtros genérica con:
 *    - Filtro global (TextField).
 *    - Botón para descargar Excel (opcional).
 *    - Botón para refrescar datos (opcional).
 *    - Botón para cambiar de tema (siempre visible).
 *
 *   Ajustado para que todos los elementos (filtro global y botones)
 *   aparezcan alineados a la izquierda.
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
 * @param {object} props - Propiedades del componente.
 * @param {string} props.globalFilterValue - Valor del filtro global (texto de búsqueda).
 * @param {function} props.onGlobalFilterChange - Función que se invoca cuando cambia el texto del filtro global.
 * @param {function} [props.onDownloadExcel] - (Opcional) Función para descargar datos en formato Excel.
 * @param {function} [props.onRefresh] - (Opcional) Función para refrescar datos.
 * @param {function} [props.onThemeToggle] - (Opcional) Función para alternar entre modo oscuro y claro.
 * @param {boolean} props.isDarkMode - Indica si el modo oscuro está activo.
 *
 * @returns {JSX.Element} - Elemento JSX que representa la barra de filtros.
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
   * Maneja el evento de alternar el tema (oscuro <-> claro).
   */
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  /**
   * Estilos en línea para la barra de herramientas.
   * Se define un contenedor con `display: flex` para ubicar
   * todos los elementos de manera horizontal.
   */
  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-filterbar-bg)',
    height: '48px',
    maxWidth: '100%',
    padding: '0 8px',
    gap: '8px',
    boxSizing: 'border-box'
  };

  return (
    <div style={toolbarStyle}>
      {/*
        Filtro global.
        Se ha removido `marginLeft: 'auto'` para que permanezca
        a la izquierda junto al resto de iconos.
      */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Búsqueda global"
        value={globalFilterValue}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        sx={{
          width: '220px',
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            minHeight: '30px',
            lineHeight: 1.2,
            '& input': {
              padding: '2px 6px',
              fontSize: '1rem',
              color: '#ffffff'
            }
          }
        }}
      />

      {/*
        Botón para descargar Excel (opcional).
        Sólo se muestra si se pasa la prop `onDownloadExcel`.
      */}
      {onDownloadExcel && (
        <Tooltip title="Descargar datos en formato Excel" arrow>
          <IconButton
            size="small"
            onClick={onDownloadExcel}
            sx={{
              color: isDarkMode ? '#eee' : '#333'
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

      {/*
        Botón para cambiar entre modo oscuro y claro.
        Se muestra siempre.
      */}
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

      {/*
        Botón para refrescar datos (opcional).
        Sólo se muestra si se pasa la prop `onRefresh`.
      */}
      {onRefresh && (
        <Tooltip title="Refrescar datos" arrow>
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{
              color: isDarkMode ? '#eee' : '#333'
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
