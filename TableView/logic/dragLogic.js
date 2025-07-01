/************************************************************************************
 * Archivo: /components/TableView/logic/dragLogic.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Lógica y controladores de eventos para permitir el arrastre de columnas y filas
 * y la selección dinámica de celdas durante dicho arrastre.
 * 
 * SRP:
 *  - Manejar exclusivamente la mecánica de "drag" (mousedown, mousemove, mouseup, etc.)
 ************************************************************************************/

import { selectColumnRange, selectRowRange } from './selectionLogic';

/**
 * initDragListeners
 * ------------------------------------------------------------------------------
 * Configura los listeners globales (document) para arrastrar columnas/filas.
 * Se encarga de la suscripción a `mousemove`, `mouseup`, `touchmove`, `touchend`.
 *
 * @param {object} params
 * @param {React.RefObject} params.containerRef  - Ref al contenedor scrolleable
 * @param {Function} params.setIsDraggingColumns - Setter para estado local
 * @param {Function} params.setIsDraggingRows    - Setter para estado local
 * @param {Function} params.setStartColIndex     - Setter para estado local
 * @param {Function} params.setStartRowIndex     - Setter para estado local
 * @param {object}   params.dragStateRef         - Objeto ref con flags de arrastre
 * @param {Array}    params.rows                 - Filas del react-table
 * @param {Function} params.selectColumnRangeFn  - Función para seleccionar columnas en rango
 * @param {Function} params.selectRowRangeFn     - Función para seleccionar filas en rango
 */
export function initDragListeners({
  containerRef,
  setIsDraggingColumns,
  setIsDraggingRows,
  setStartColIndex,
  setStartRowIndex,
  dragStateRef,
  rows,
  selectColumnRangeFn,
  selectRowRangeFn,
}) {
  /**
   * handlePointerMove:
   * - Ubica la columna/fila actual en la posición del puntero.
   * - Llama a selectColumnRangeFn o selectRowRangeFn según corresponda.
   */
  const handlePointerMove = (clientX, clientY, e) => {
    const {
      isDraggingCols,
      isDraggingRows,
      startColIndex: stCol,
      startRowIndex: stRow,
    } = dragStateRef.current;

    if (!containerRef.current) return;

    if (isDraggingCols) {
      e.preventDefault();
      const colEls = containerRef.current.querySelectorAll('thead tr:first-child th');
      let currentIndex = null;

      colEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          currentIndex = i;
        }
      });

      if (currentIndex != null) {
        selectColumnRangeFn(stCol, currentIndex);
      }
    } else if (isDraggingRows) {
      e.preventDefault();
      const rowIndexCells = containerRef.current.querySelectorAll('tbody tr td[data-col="0"]');
      let currentRow = null;

      rowIndexCells.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          currentRow = i;
        }
      });

      if (currentRow != null) {
        selectRowRangeFn(stRow, currentRow);
      }
    }
  };

  /** handleMouseMove */
  const handleMouseMove = (evt) => {
    const { isDraggingCols, isDraggingRows } = dragStateRef.current;
    if (!isDraggingCols && !isDraggingRows) return;
    handlePointerMove(evt.clientX, evt.clientY, evt);
  };

  /** handleMouseUp */
  const handleMouseUp = () => {
    dragStateRef.current.isDraggingCols = false;
    dragStateRef.current.isDraggingRows = false;
    dragStateRef.current.startColIndex = null;
    dragStateRef.current.startRowIndex = null;
    setIsDraggingColumns(false);
    setIsDraggingRows(false);
    setStartColIndex(null);
    setStartRowIndex(null);
  };

  /** handleTouchMove */
  const handleTouchMove = (evt) => {
    const { isDraggingCols, isDraggingRows } = dragStateRef.current;
    if (!isDraggingCols && !isDraggingRows) return;

    if (evt.touches.length === 1) {
      const touch = evt.touches[0];
      handlePointerMove(touch.clientX, touch.clientY, evt);
    }
  };

  /** handleTouchEnd */
  const handleTouchEnd = () => {
    dragStateRef.current.isDraggingCols = false;
    dragStateRef.current.isDraggingRows = false;
    dragStateRef.current.startColIndex = null;
    dragStateRef.current.startRowIndex = null;
    setIsDraggingColumns(false);
    setIsDraggingRows(false);
    setStartColIndex(null);
    setStartRowIndex(null);
  };

  // Suscribirse a los eventos globales:
  document.addEventListener('mousemove', handleMouseMove, { passive: false });
  document.addEventListener('mouseup', handleMouseUp, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Retornar una función de cleanup (para usarla en useEffect)
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * handleHeaderMouseDown
 * ------------------------------------------------------------------------------
 * Handler para iniciar arrastre de columna (mousedown).
 */
export function handleHeaderMouseDown(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex) {
  if (evt.target.classList.contains('resize-handle')) return; // Evitar colisión con Resize
  if (colId === '_selectIndex') return; // No arrastrar la col índice

  dragStateRef.current.isDraggingCols = true;
  dragStateRef.current.startColIndex = colIndex;
  setIsDraggingColumns(true);
  setStartColIndex(colIndex);
}

/**
 * handleHeaderTouchStart
 * ------------------------------------------------------------------------------
 * Versión touchstart para arrastre de columnas.
 */
export function handleHeaderTouchStart(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex) {
  if (colId === '_selectIndex') return;
  if (evt.target.classList.contains('resize-handle')) return;
  if (evt.touches.length === 1) {
    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  }
}

/**
 * handleRowIndexMouseDown
 * ------------------------------------------------------------------------------
 * Handler para iniciar arrastre de filas al hacer click en la columna índice.
 */
export function handleRowIndexMouseDown(evt, rowIndex, rowId, selectEntireRowFn, dragStateRef, setIsDraggingRows, setStartRowIndex) {
  evt.stopPropagation();
  evt.preventDefault();

  // Seleccionar la fila completa
  selectEntireRowFn(rowIndex, rowId);

  dragStateRef.current.isDraggingRows = true;
  dragStateRef.current.startRowIndex = rowIndex;
  setIsDraggingRows(true);
  setStartRowIndex(rowIndex);
}

/**
 * handleRowIndexTouchStart
 * ------------------------------------------------------------------------------
 * Versión touchstart para arrastre de filas.
 */
export function handleRowIndexTouchStart(evt, rowIndex, rowId, selectEntireRowFn, dragStateRef, setIsDraggingRows, setStartRowIndex) {
  evt.stopPropagation();
  evt.preventDefault();

  if (evt.touches.length === 1) {
    selectEntireRowFn(rowIndex, rowId);
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  }
}
