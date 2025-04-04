/************************************************************************************
 * LOCATION: /components/registros/TableView/contextMenu/useTableViewContextMenu.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Este hook encapsula la lógica del menú contextual, usando `closest()` para
 *   diferenciar con precisión si el clic derecho ocurrió en la cabecera o en una celda de datos.
 *
 * @version 1.2
 ************************************************************************************/

import { useState } from 'react';

/**
 * useTableViewContextMenu
 *
 * Hook que gestiona el menú contextual de la tabla:
 *  - Almacena la posición (x, y) donde se hace clic derecho.
 *  - Determina si el clic fue en cabecera (columna) o en fila.
 *  - Provee funciones para copiar celdas, ocultar columnas/filas, etc.
 *
 * @param {Array}    selectedCells    - Lista de celdas seleccionadas ({id, colField}).
 * @param {Function} doCopyCells      - Función que copia las celdas al portapapeles (formato TSV).
 * @param {Function} [onHideColumns]  - Callback para ocultar columnas.
 * @param {Function} [onHideRows]     - Callback para ocultar filas.
 * @param {Object}   table            - Instancia de react-table.
 * @param {Array}    rows             - Filas procesadas por la tabla.
 *
 * @returns {Object} - Referencias y funciones para manejar el menú contextual.
 */
export default function useTableViewContextMenu({
  selectedCells,
  doCopyCells,
  onHideColumns,
  onHideRows,
  table,
  rows,
}) {
  // Estado que guarda posición del menú y qué se ha clicado
  const [contextMenu, setContextMenu] = useState(null); // { mouseX, mouseY }
  const [clickedHeaderIndex, setClickedHeaderIndex] = useState(null);
  const [clickedRowIndex, setClickedRowIndex] = useState(null);

  /**
   * handleContextMenu
   *  - Detecta con `closest()` si el clic fue en un elemento con `data-header-index`
   *    o en uno con `data-row`.
   */
  const handleContextMenu = (e) => {
    e.preventDefault();

    // 1. Intentar encontrar un elemento padre con data-header-index
    const headerEl = e.target.closest('[data-header-index]');
    // 2. Si no lo encuentra, buscar un elemento padre con data-row
    const rowEl = e.target.closest('[data-row]');

    let foundHeaderIndex = null;
    let foundRowIndex = null;

    if (headerEl) {
      foundHeaderIndex = parseInt(headerEl.getAttribute('data-header-index'), 10);
    } else if (rowEl) {
      foundRowIndex = parseInt(rowEl.getAttribute('data-row'), 10);
    }

    setClickedHeaderIndex(foundHeaderIndex);
    setClickedRowIndex(foundRowIndex);

    // Asignar la posición del menú contextual
    setContextMenu(
      contextMenu === null
        ? { mouseX: e.clientX + 2, mouseY: e.clientY - 6 }
        : null
    );
  };

  /**
   * handleCloseContextMenu
   *  - Cierra el menú y resetea los índices.
   */
  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setClickedHeaderIndex(null);
    setClickedRowIndex(null);
  };

  /**
   * handleCopyFromMenu
   *  - Copia las celdas seleccionadas y cierra el menú.
   */
  const handleCopyFromMenu = async () => {
    handleCloseContextMenu();
    if (!selectedCells?.length) return;
    await doCopyCells(selectedCells);
  };

  /**
   * handleHideColumn
   *  - Oculta la columna en la cabecera donde se hizo clic.
   */
  const handleHideColumn = () => {
    handleCloseContextMenu();
    if (!onHideColumns || clickedHeaderIndex == null) return;

    const col = table.getVisibleFlatColumns()[clickedHeaderIndex];
    if (!col) return;
    if (col.id === '_selectIndex') return; // Evita ocultar la col índice

    onHideColumns([col.id]);
  };

  /**
   * handleHideRow
   *  - Oculta la fila clicada. Si hay múltiples filas seleccionadas y el clic
   *    fue en una de ellas, se ocultan todas.
   */
  const handleHideRow = () => {
    handleCloseContextMenu();
    if (!onHideRows || clickedRowIndex == null) return;

    // Determina cuántas filas están seleccionadas
    // (id en selectedCells -> encontrar su índice en 'rows')
    const selectedRowIndexes = new Set(
      selectedCells
        .map((cell) => rows.findIndex((r) => r.id === cell.id))
        .filter((idx) => idx !== -1)
    );

    const clickedIsSelected = selectedRowIndexes.has(clickedRowIndex);

    // Ocultar todas si la clicada estaba en la selección y la selección tiene varias
    if (clickedIsSelected && selectedRowIndexes.size > 1) {
      onHideRows(Array.from(selectedRowIndexes));
    } else {
      onHideRows([clickedRowIndex]);
    }
  };

  return {
    contextMenu,
    clickedHeaderIndex,
    clickedRowIndex,
    handleContextMenu,
    handleCloseContextMenu,
    handleCopyFromMenu,
    handleHideColumn,
    handleHideRow,
  };
}
