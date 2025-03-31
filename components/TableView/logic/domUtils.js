/************************************************************************************
 * Archivo: /components/TableView/logic/domUtils.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Funciones de ayuda para manipular/leer el DOM dentro de la tabla.
 *
 * SRP:
 *  - Dedicado a proveer utilidades DOM para TableView.
 ************************************************************************************/

/**
 * getCellsInfo
 * ------------------------------------------------------------------------------
 * Lee el DOM para cada <td data-row="rowId" data-col="cIndex" />,
 * recuperando posición (x, y, width, height) + rowId + colField.
 * 
 * @param {React.RefObject} containerRef - Referencia al contenedor principal (scroll)
 * @param {object} table - Instancia de la tabla (react-table)
 * @returns {Array} Listado de celdas con { id, colField, x, y, width, height }
 */
export function getCellsInfo(containerRef, table) {
  if (!containerRef.current) return [];

  const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
  const cells = [];

  cellEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const rowIdString = el.getAttribute('data-row');
    const cIndex = parseInt(el.getAttribute('data-col'), 10);

    if (!rowIdString || isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const colObj = table.getVisibleFlatColumns()[cIndex];
    if (colObj) {
      cells.push({
        id: rowIdString,       // Este es el ID real de la fila
        colField: colObj.id,   // Identificador de columna
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }
  });
  return cells;
}
