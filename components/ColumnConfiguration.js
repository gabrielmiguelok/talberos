/************************************************************************************
 * LOCATION: /components/components/ColumnConfiguration.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Componente que muestra un panel (popover) para configurar el filtro y el orden
 *   de una columna específica. Soporta operadores de texto y numéricos, y un
 *   sortDirection (asc/desc/none).
 *
 *   - operatorsText (para columnas texto).
 *   - operatorsNumeric (para columnas numéricas).
 *   - sortOptions correspondientes.
 *
 * @version 3.0
 ************************************************************************************/

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

/**
 * Componente que renderiza la configuración de un filtro (operator, value, etc.)
 * y la selección de orden (sortDirection) para una columna en particular.
 *
 * @param {Object} props
 * @param {string} props.menuColumnId - Identificador de la columna a configurar.
 * @param {Object} props.columnFilters - Objeto con los filtros actuales de todas las columnas.
 * @param {Function} props.updateColumnFilter - Función para actualizar el filtro de una columna (colId, newValues).
 * @param {Array} props.originalColumnsDef - Definición original de columnas, para detectar si es numérica.
 *
 * @returns {JSX.Element|null} - Devuelve el panel de configuración o null si `menuColumnId` no existe.
 */
export default function ColumnFilterConfiguration({
  menuColumnId,
  columnFilters,
  updateColumnFilter,
  originalColumnsDef,
}) {
  if (!menuColumnId) return null;

  const currentFilter = columnFilters[menuColumnId] || {};
  const currentColDef = originalColumnsDef.find(
    (c) => c.accessorKey === menuColumnId
  );
  const isNumeric = currentColDef?.isNumeric || false;

  // Operador actual para la columna (range, exact, etc.) o default
  const currentOperator =
    currentFilter.operator || (isNumeric ? 'range' : 'contains');

  // sortDirection actual (asc, desc, none)
  const sortDirection = currentFilter.sortDirection || 'none';

  // Manejadores de eventos
  const handleOperatorChange = (e) => {
    updateColumnFilter(menuColumnId, { operator: e.target.value });
  };
  const handleSearchChange = (e) => {
    updateColumnFilter(menuColumnId, { value: e.target.value });
  };
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

  // Render
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
      {/* Opciones de orden (sort asc/desc) */}
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

      {/* Si la columna es numérica, mostramos operadores numeric; si no, operadores text */}
      {isNumeric ? (
        <>
          <Select
            size="small"
            value={currentOperator}
            onChange={handleOperatorChange}
            sx={{ fontSize: '0.8rem', backgroundColor: 'var(--color-bg-paper)', color: 'var(--color-text)' }}
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
            sx={{ fontSize: '0.8rem', backgroundColor: 'var(--color-bg-paper)', color: 'var(--color-text)' }}
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
