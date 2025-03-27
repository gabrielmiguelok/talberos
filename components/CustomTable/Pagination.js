/**
 * Archivo: /components/CustomTable/Pagination.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   Este componente muestra una interfaz de paginación para `CustomTable`.
 *   Incluye control de filas por página, rango actual y botones de navegación.
 *
 *   - Muestra la cantidad de filas por página (en un <Select>).
 *   - Indica el rango actual (ej. "1-50 de 200").
 *   - Botones para pasar a la página anterior y siguiente.
 *
 * DEPENDENCIAS:
 *   - @mui/material
 *   - Icons: KeyboardArrowLeftIcon, KeyboardArrowRightIcon
 *
 * @version 1.0
 */

import React from 'react';
import { Box, Typography, Select, MenuItem, IconButton } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

/**
 * Componente de paginación para `CustomTable`.
 *
 * @function Pagination
 * @param {Object} props - Props del componente.
 * @param {Object} props.table - Instancia de la tabla (react-table) con estado de paginación.
 *
 * @returns {JSX.Element} - Render del componente de paginación.
 *
 * USO:
 * ~~~jsx
 * <Pagination table={tableInstance} />
 * ~~~
 */
export default function Pagination({ table }) {
  // Destructuramos el estado de paginación
  const { pageSize, pageIndex } = table.getState().pagination;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, totalRows);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '2px 4px',
        backgroundColor: 'var(--color-bg-paper)',
        color: 'var(--color-text)',
        mt: 1,
        minHeight: '32px',
        borderTop: '0px solid var(--color-divider)',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 500, mr: 0.5, color: 'inherit' }}>
        Rows per page:
      </Typography>

      <Select
        size="small"
        value={pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        sx={{
          minWidth: '50px',
          fontSize: '0.75rem',
          color: 'inherit',
          '& .MuiSelect-select': { padding: '4px' },
        }}
      >
        {[50, 100].map((size) => (
          <MenuItem key={size} value={size} sx={{ fontSize: '0.75rem', padding: '4px 8px' }}>
            {size}
          </MenuItem>
        ))}
      </Select>

      <Typography variant="caption" sx={{ fontSize: '0.75rem', mx: 1, color: 'inherit' }}>
        {from}-{to} de {totalRows}
      </Typography>

      <IconButton
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        size="small"
        sx={{ p: 0.5, color: 'inherit' }}
      >
        <KeyboardArrowLeftIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        size="small"
        sx={{ p: 0.5, color: 'inherit' }}
      >
        <KeyboardArrowRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
