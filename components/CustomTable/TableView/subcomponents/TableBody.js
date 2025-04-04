/************************************************************************************
 * Archivo: /components/TableView/subcomponents/TableBody.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza el <tbody> de la tabla, incluyendo cada fila y celda. Se encarga de
 * aplicar las clases de selección, copiado, y el input para edición inline.
 *
 * SRP:
 *  - Única responsabilidad: pintar las filas/celdas del cuerpo de la tabla.
 *
 ************************************************************************************/

import React from 'react';
import { SELECTED_CELL_CLASS, COPIED_CELL_CLASS } from './tableViewVisualEffects';
import getSafeDisplayValue from '../utils/getSafeDisplayValue';

/**
 * TableBody
 * @param {object} props
 * @param {Array} props.rows - Filas de la tabla (react-table)
 * @param {number} props.rowHeight - Altura de cada fila
 * @param {Function} props.isEditingCell - fn(rowId, colId) => bool
 * @param {string} props.editingValue
 * @param {Function} props.handleDoubleClick
 * @param {Function} props.handleChange
 * @param {Function} props.handleEditKeyDown
 * @param {Function} props.handleBlur
 * @param {Array} props.selectedCells
 * @param {Array} props.copiedCells
 * @param {Function} props.handleCellClick
 * @param {Function} props.onRowIndexMouseDown
 * @param {Function} props.onRowIndexTouchStart
 * @param {number} props.highlightedRowIndex
 * @returns JSX.Element
 */
export default function TableBody({
  rows,
  rowHeight,
  isEditingCell,
  editingValue,
  handleDoubleClick,
  handleChange,
  handleEditKeyDown,
  handleBlur,
  selectedCells,
  copiedCells,
  handleCellClick,
  onRowIndexMouseDown,
  onRowIndexTouchStart,
  highlightedRowIndex,
}) {
  return (
    <tbody>
      {rows.map((row, rIndex) => {
        const rowId = row.id; // ID real de la fila
        const rowIsHighlighted = highlightedRowIndex === rIndex;

        return (
          <tr
            key={rowId}
            style={{
              height: rowHeight,
              backgroundColor: rowIsHighlighted
                ? 'var(--color-table-row-highlight, #fff9e6)'
                : 'transparent',
            }}
          >
            {row.getVisibleCells().map((cell, cIndex) => {
              const colId = cell.column.id;
              const isIndexCol = colId === '_selectIndex';

              // ¿La celda está seleccionada o copiada?
              const isSelected = selectedCells.some(
                (sc) => sc.id === rowId && sc.colField === colId
              );
              const isCopied = copiedCells.some(
                (cc) => cc.id === rowId && cc.colField === colId
              );

              // ¿En edición inline?
              const inEditingMode = isEditingCell(rowId, colId);
              const rawValue = cell.getValue();

              // Renderizador custom, si la columna define su propio "cell"
              const customRender = cell.column.columnDef.cell
                ? cell.column.columnDef.cell({
                    getValue: () => rawValue,
                    column: cell.column,
                    row: cell.row,
                    table: cell.table, // a veces se pasa si es necesario
                  })
                : rawValue;

              const displayValue = getSafeDisplayValue(customRender);

              let cellContent;
              if (inEditingMode) {
                cellContent = (
                  <input
                    type="text"
                    autoFocus
                    value={editingValue}
                    onChange={handleChange}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleBlur}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              } else {
                cellContent = displayValue;
              }

              return (
                <td
                  key={cell.id}
                  data-row={rowId}
                  data-col={cIndex}
                  className={`custom-td ${
                    isSelected ? SELECTED_CELL_CLASS : ''
                  } ${isCopied ? COPIED_CELL_CLASS : ''}`}
                  style={{
                    backgroundColor: isIndexCol
                      ? 'var(--color-table-index-body)'
                      : 'transparent',
                    fontWeight: isIndexCol ? 'bold' : 'normal',
                    cursor: isIndexCol ? 'pointer' : 'auto',
                  }}
                  onDoubleClick={() => handleDoubleClick(rowId, colId, displayValue)}
                  onClick={() => handleCellClick(rIndex)}
                  onMouseDown={(evt) => {
                    // Si es la col índice, iniciamos arrastre de fila
                    if (isIndexCol) {
                      onRowIndexMouseDown(evt, rIndex, rowId);
                    }
                  }}
                  onTouchStart={(evt) => {
                    // Si es la col índice, iniciamos arrastre de fila
                    if (isIndexCol && evt.touches.length === 1) {
                      onRowIndexTouchStart(evt, rIndex, rowId);
                    }
                  }}
                >
                  {cellContent}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
