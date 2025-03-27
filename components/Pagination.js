/************************************************************************************
 * UBICACION: components/components/Pagination.js
 * Descripción:
 *   - Componente de paginación minimalista, sofisticado y responsivo, inspirado en
 *     tableros finitos (como Excel) para 10 filas.
 *   - Conserva la lógica de interacción con los importadores.
 ************************************************************************************/
import React from 'react';
import { Box, Select, MenuItem, IconButton, Typography } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function Pagination({ table }) {
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
        backgroundColor: '#fff',
        gap: 1,
        mt: 1,
        minHeight: '32px',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 500, mr: 0.5 }}>
        Rows per page:
      </Typography>
      <Select
        size="small"
        value={pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        sx={{
          minWidth: '50px',
          fontSize: '0.75rem',
          '& .MuiSelect-select': {
            padding: '4px',
          },
        }}
      >
        {[25, 50, 100].map((size) => (
          <MenuItem key={size} value={size} sx={{ fontSize: '0.75rem', padding: '4px 8px' }}>
            {size}
          </MenuItem>
        ))}
      </Select>
      <Typography variant="caption" sx={{ fontSize: '0.75rem', mx: 1 }}>
        {from}-{to} of {totalRows}
      </Typography>
      <IconButton
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        size="small"
        sx={{ p: 0.5 }}
      >
        <KeyboardArrowLeftIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        size="small"
        sx={{ p: 0.5 }}
      >
        <KeyboardArrowRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
