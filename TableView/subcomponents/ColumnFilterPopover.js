/************************************************************************************
 * Archivo: /components/TableView/subcomponents/ColumnFilterPopover.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza el <Popover> que contiene la configuración de filtro para la columna.
 *
 * SRP:
 *  - Único propósito: agrupar el Popover + su contenido (ColumnFilterConfiguration).
 *
 ************************************************************************************/

import React from 'react';
import { Popover } from '@mui/material';
import ColumnFilterConfiguration from '../../ColumnConfiguration';

export default function ColumnFilterPopover({
  anchorEl,
  menuColumnId,
  handleCloseMenu,
  columnFilters,
  updateColumnFilter,
  originalColumnsDef,
}) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <ColumnFilterConfiguration
        menuColumnId={menuColumnId}
        columnFilters={columnFilters}
        updateColumnFilter={updateColumnFilter}
        originalColumnsDef={originalColumnsDef}
      />
    </Popover>
  );
}
