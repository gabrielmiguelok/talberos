/************************************************************************************
 * Archivo: /components/TableView/subcomponents/ContextualMenu.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza el <Menu> contextual para copiar celdas u ocultar filas/columnas.
 *
 * SRP:
 *  - Único propósito: mostrar el menú contextual con sus ítems.
 *
 ************************************************************************************/

import React from 'react';
import { Menu, MenuItem } from '@mui/material';

export default function ContextualMenu({
  contextMenu,
  handleCloseContextMenu,
  handleCopyFromMenu,
  clickedHeaderIndex,
  onHideColumns,
  handleHideColumn,
  clickedRowIndex,
  onHideRows,
  handleHideRow,
}) {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleCloseContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleCopyFromMenu}>Copiar</MenuItem>

      {/* Opción de ocultar columnas (si la col no es nula y tenemos callback) */}
      {onHideColumns && clickedHeaderIndex != null && (
        <MenuItem onClick={handleHideColumn}>Ocultar columna</MenuItem>
      )}

      {/* Opción de ocultar filas */}
      {onHideRows && clickedRowIndex != null && (
        <MenuItem onClick={handleHideRow}>Ocultar fila</MenuItem>
      )}
    </Menu>
  );
}
