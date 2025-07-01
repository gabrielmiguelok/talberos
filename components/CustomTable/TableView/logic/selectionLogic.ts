/************************************************************************************
 * Archivo: /components/TableView/logic/selectionLogic.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Funciones puramente lógicas para la selección de celdas, columnas y filas.
 * 
 * SRP:
 *  - Cada función se dedica a un modo de selección (columna, fila, rango, etc.).
 *
 ************************************************************************************/

/**
 * selectColumnRange
 * ------------------------------------------------------------------------------
 * Selecciona todas las celdas entre dos índices de columna (start y end).
 */
export function selectColumnRange({ rows, visibleCols, start, end }) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const newSelection = [];
  rows.forEach((r) => {
    for (let c = min; c <= max; c++) {
      const col = visibleCols[c];
      if (!col || col.id === '_selectIndex') continue;
      newSelection.push({ id: r.id, colField: col.id });
    }
  });
  return newSelection;
}

/**
 * selectRowRange
 * ------------------------------------------------------------------------------
 * Selecciona todas las celdas entre dos índices de fila (start y end).
 */
export function selectRowRange({ rows, visibleCols, start, end }) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const newSelection = [];

  for (let r = min; r <= max; r++) {
    const rowObj = rows[r];
    if (!rowObj) continue;
    visibleCols.forEach((col) => {
      if (col.id !== '_selectIndex') {
        newSelection.push({ id: rowObj.id, colField: col.id });
      }
    });
  }
  return newSelection;
}

/**
 * selectEntireRow
 * ------------------------------------------------------------------------------
 * Selecciona todas las celdas de una fila (menos la columna índice).
 */
export function selectEntireRow({ rowIndex, rowId, visibleCols }) {
  return visibleCols
    .filter((c) => c.id !== '_selectIndex')
    .map((c) => ({ id: rowId, colField: c.id }));
}

/**
 * selectEntireColumn
 * ------------------------------------------------------------------------------
 * Selecciona todas las celdas de una columna en específico.
 */
export function selectEntireColumn({ rows, colId }) {
  return rows.map((r) => ({
    id: r.id,
    colField: colId,
  }));
}

/**
 * selectAllCells
 * ------------------------------------------------------------------------------
 * Selecciona todas las celdas de todas las filas y columnas (excepto la col índice).
 */
export function selectAllCells({ rows, visibleCols }) {
  const allCells = [];
  rows.forEach((r) => {
    visibleCols.forEach((col) => {
      if (col.id !== '_selectIndex') {
        allCells.push({ id: r.id, colField: col.id });
      }
    });
  });
  return allCells;
}
