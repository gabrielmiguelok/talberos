/************************************************************************************
 * Archivo: /components/TableView/subcomponents/TableHeader.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza el <thead> de la tabla, con todas sus celdas de cabecera, íconos de filtro
 * y manijas de resize. Todos los eventos se inyectan vía props.
 *
 * SRP:
 *  - Única responsabilidad: pintar la cabecera.
 *
 ************************************************************************************/

import React from 'react';
import { IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function TableHeader({
  headerGroups,
  handleHeaderClick,
  onHeaderMouseDown,
  onHeaderTouchStart,
  handleOpenMenu,
  handleMouseDownResize,
}) {
  return (
    <thead
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--color-bg-paper)',
      }}
    >
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header, hIndex) => {
            const colId = header.column.id;
            const isIndexCol = colId === '_selectIndex';

            return (
              <th
                key={header.id}
                className="custom-th"
                data-header-index={hIndex}
                style={{
                  backgroundColor: isIndexCol
                    ? 'var(--color-table-index-header)'
                    : 'var(--color-table-header)',
                  cursor: 'pointer',
                }}
                onClick={(evt) => handleHeaderClick(evt, hIndex, colId)}
                onMouseDown={(evt) => onHeaderMouseDown(evt, hIndex, colId)}
                onTouchStart={(evt) => onHeaderTouchStart(evt, hIndex, colId)}
              >
                <div className="column-header-content">
                  <span
                    className="column-header-label"
                    style={{ fontWeight: isIndexCol ? 'bold' : 'normal' }}
                    title={String(header.column.columnDef.header || '')}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </span>

                  {/* Ícono de filtro (excepto col índice) */}
                  {!isIndexCol && (
                    <div className="column-header-actions">
                      <IconButton
                        size="small"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          handleOpenMenu(evt, colId);
                        }}
                        sx={{
                          color: 'var(--color-text)',
                          padding: '2px',
                        }}
                      >
                        <FilterListIcon fontSize="inherit" style={{ fontSize: '14px' }} />
                      </IconButton>
                    </div>
                  )}
                </div>

                {/* Manija de resize */}
                <div
                  className="resize-handle"
                  onMouseDown={(evt) => {
                    evt.stopPropagation();
                    handleMouseDownResize(evt, colId);
                  }}
                />
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
