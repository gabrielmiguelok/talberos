/************************************************************************************
 * Archivo: /components/TableView/subcomponents/TableBody.jsx
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Renderiza el <tbody> de la tabla, incluyendo cada fila y celda. Aplica las clases de
 * selección, copiado, y pinta el input para edición inline en caso de estar editando.
 *
 * Principios SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Única responsabilidad -> pintar las filas/celdas del cuerpo de la tabla.
 *   - DIP: Recibe la información y acciones por props, sin depender de lógica interna.
 *
 * Versión:
 * ----------------------------------------------------------------------------------
 *   - 2.0
 *     - Se añade la prop "isDarkMode" para cambiar el color de la fila resaltada.
 *
 ************************************************************************************/

import React from 'react';
import { SELECTED_CELL_CLASS, COPIED_CELL_CLASS } from './tableViewVisualEffects';
import getSafeDisplayValue from '../utils/getSafeDisplayValue';

/**
 * @typedef {Object} TableBodyProps
 * @property {Array}    rows                  - Filas de la tabla (react-table).
 * @property {number}   rowHeight            - Altura de cada fila.
 * @property {Function} isEditingCell        - fn(rowId, colId) => bool (indica si esa celda está en modo edición).
 * @property {string}   editingValue         - Valor de la celda en edición.
 * @property {Function} handleDoubleClick    - Handler para iniciar la edición de una celda.
 * @property {Function} handleChange         - Handler para cambiar el valor durante la edición.
 * @property {Function} handleEditKeyDown    - Handler para capturar Enter/Escape y confirmar o cancelar la edición.
 * @property {Function} handleBlur           - Handler para confirmar edición al perder el foco.
 * @property {Array}    selectedCells        - Celdas seleccionadas { id: rowId, colField: colId }.
 * @property {Array}    copiedCells          - Celdas que han sido copiadas.
 * @property {Function} handleCellClick      - Handler de clic en la celda (para resaltar la fila).
 * @property {Function} onRowIndexMouseDown  - Handler para mousedown en la celda índice (selección de filas).
 * @property {Function} onRowIndexTouchStart - Handler para touchstart en la celda índice (selección de filas).
 * @property {number}   highlightedRowIndex  - Índice de la fila resaltada.
 * @property {boolean}  isDarkMode           - Indica si el modo oscuro está activo o no.
 */

/**
 * TableBody
 * ----------------------------------------------------------------------------------
 * Renderiza cada fila y celda del cuerpo de la tabla, aplicando selección, copiado
 * y edición en línea según corresponda. También resalta la fila si coincide con
 * "highlightedRowIndex", eligiendo distinto color si "isDarkMode = true".
 *
 * @param {TableBodyProps} props - Propiedades del componente.
 * @returns {JSX.Element}
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
  isDarkMode = false,
}) {
  return (
    <tbody>
      {rows.map((row, rIndex) => {
        // row.id es un identificador interno de React Table
        const rowId = row.id;

        // Determina si la fila actual se encuentra resaltada
        const rowIsHighlighted = highlightedRowIndex === rIndex;

        // Definimos el color de fondo para la fila resaltada según el modo oscuro
        const highlightColor = isDarkMode ? '#555555' : '#e6f7ff';

        return (
          <tr
            key={rowId}
            style={{
              height: rowHeight,
              // Si la fila está resaltada, usamos highlightColor. De lo contrario, transparente.
              backgroundColor: rowIsHighlighted ? highlightColor : 'transparent',
            }}
          >
            {row.getVisibleCells().map((cell, cIndex) => {
              const colId = cell.column.id;
              const isIndexCol = colId === '_selectIndex';

              // Determinamos si la celda está seleccionada o copiada
              const isSelected = selectedCells.some(
                (sc) => sc.id === rowId && sc.colField === colId
              );
              const isCopied = copiedCells.some(
                (cc) => cc.id === rowId && cc.colField === colId
              );

              // ¿Estamos editando esta celda en concreto?
              const inEditingMode = isEditingCell(rowId, colId);
              const rawValue = cell.getValue();

              // Render custom si la columna tiene "cell: (props) => ..."
              const customRender = cell.column.columnDef.cell
                ? cell.column.columnDef.cell({
                    getValue: () => rawValue,
                    column: cell.column,
                    row: cell.row,
                    table: cell.table,
                  })
                : rawValue;

              // Prevenir que un valor "undefined" o "null" rompa el render
              const displayValue = getSafeDisplayValue(customRender);

              // Definimos el contenido de la celda: input (edición) o texto
              const cellContent = inEditingMode ? (
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
              ) : (
                displayValue
              );

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
                      : 'inherit',
                    fontWeight: isIndexCol ? 'bold' : 'normal',
                    cursor: isIndexCol ? 'pointer' : 'auto',
                  }}
                  onDoubleClick={() => handleDoubleClick(rowId, colId, displayValue)}
                  onClick={() => handleCellClick(rIndex)}
                  onMouseDown={(evt) => {
                    if (isIndexCol) {
                      onRowIndexMouseDown(evt, rIndex, rowId);
                    }
                  }}
                  onTouchStart={(evt) => {
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
