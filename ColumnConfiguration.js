/**
 * Archivo: /components/ColumnConfiguration.jsx
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *  - Popover con controles para filtrar una columna (texto, numérico) y ordenarla.
 */

import React from 'react';
import { Box, Select, MenuItem } from '@mui/material';

const operatorsText = [
  { label: 'Contiene', value: 'contains' },
  { label: 'Empieza con', value: 'startsWith' },
  { label: 'Termina con', value: 'endsWith' },
  { label: 'Igual a', value: 'equals' },
];

const operatorsNumeric = [
  { label: 'Rango', value: 'range' },
  { label: 'Exacto', value: 'exact' },
];

const sortTextOptions = [
  { label: 'Sin orden', value: 'none' },
  { label: 'A-Z', value: 'asc' },
  { label: 'Z-A', value: 'desc' },
];

const sortNumOptions = [
  { label: 'Sin orden', value: 'none' },
  { label: 'Asc', value: 'asc' },
  { label: 'Desc', value: 'desc' },
];

const inputStyles = {
  width: '100%',
  fontSize: '0.8rem',
  padding: '4px',
  borderRadius: '4px',
  border: '1px solid var(--color-divider)',
  backgroundColor: 'var(--color-bg-paper)',
  color: 'var(--color-text)',
};

export default function ColumnFilterConfiguration({
  menuColumnId,
  columnFilters,
  updateColumnFilter,
  originalColumnsDef,
}) {
  if (!menuColumnId) return null;

  const currentFilter = columnFilters[menuColumnId] || {};
  const currentColDef = originalColumnsDef.find((c) => c.accessorKey === menuColumnId);
  const isNumeric = currentColDef?.isNumeric || false;
  const currentOperator = currentFilter.operator || (isNumeric ? 'range' : 'contains');
  const sortDirection = currentFilter.sortDirection || 'none';
  const sortOptions = isNumeric ? sortNumOptions : sortTextOptions;

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: 'var(--color-bg-paper)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-divider)',
      },
    },
  };

  // Handlers
  const handleOperatorChange = (e) =>
    updateColumnFilter(menuColumnId, { operator: e.target.value });

  const handleSearchChange = (e) =>
    updateColumnFilter(menuColumnId, { value: e.target.value });

  const normalizeNumber = (val) => {
    if (val === '') return undefined;
    return Number(val.replace(',', '.'));
  };

  const handleMinChange = (e) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { min: val });
  };

  const handleMaxChange = (e) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { max: val });
  };

  const handleExactNumberChange = (e) => {
    const val = normalizeNumber(e.target.value);
    updateColumnFilter(menuColumnId, { exact: val });
  };

  const handleSortChange = (e) => {
    updateColumnFilter(menuColumnId, { sortDirection: e.target.value });
  };

  return (
    <Box
      sx={{
        p: 1,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'var(--color-bg-paper)',
        border: '1px solid var(--color-divider)',
        color: 'var(--color-text)',
        borderRadius: '4px',
      }}
    >
      {/* Orden asc/desc */}
      <Select
        size="small"
        value={sortDirection}
        onChange={handleSortChange}
        sx={{ fontSize: '0.8rem', backgroundColor: 'var(--color-bg-paper)', color: 'var(--color-text)' }}
        MenuProps={menuProps}
      >
        {sortOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ fontSize: '0.8rem', color: 'var(--color-text)' }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* Filtro numérico o de texto */}
      {isNumeric ? (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{
              fontSize: '0.8rem',
              backgroundColor: 'var(--color-bg-paper)',
              color: 'var(--color-text)',
            }}
            MenuProps={menuProps}
          >
            {operatorsNumeric.map((op) => (
              <MenuItem
                key={op.value}
                value={op.value}
                sx={{ fontSize: '0.8rem', color: 'var(--color-text)' }}
              >
                {op.label}
              </MenuItem>
            ))}
          </Select>

          {currentOperator === 'range' && (
            <Box sx={{ display: 'flex', gap: '4px' }}>
              <input
                type="number"
                placeholder="Mín"
                value={currentFilter.min ?? ''}
                onChange={handleMinChange}
                style={{ ...inputStyles, width: '60px' }}
              />
              <input
                type="number"
                placeholder="Máx"
                value={currentFilter.max ?? ''}
                onChange={handleMaxChange}
                style={{ ...inputStyles, width: '60px' }}
              />
            </Box>
          )}

          {currentOperator === 'exact' && (
            <input
              type="number"
              placeholder="Valor exacto"
              value={currentFilter.exact ?? ''}
              onChange={handleExactNumberChange}
              style={inputStyles}
            />
          )}
        </>
      ) : (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{
              fontSize: '0.8rem',
              backgroundColor: 'var(--color-bg-paper)',
              color: 'var(--color-text)',
            }}
            MenuProps={menuProps}
          >
            {operatorsText.map((op) => (
              <MenuItem
                key={op.value}
                value={op.value}
                sx={{ fontSize: '0.8rem', color: 'var(--color-text)' }}
              >
                {op.label}
              </MenuItem>
            ))}
          </Select>

          <input
            type="text"
            placeholder="Buscar..."
            value={currentFilter.value || ''}
            onChange={handleSearchChange}
            style={inputStyles}
          />
        </>
      )}
    </Box>
  );
}
