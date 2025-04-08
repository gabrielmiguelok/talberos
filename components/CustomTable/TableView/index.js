/************************************************************************************
 * Archivo: /components/TableView/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * ----------------------------------------------------------------------------------
 * Este sub-componente se encarga de orquestar la vista + interacción de la tabla
 * y la barra de paginación sticky, delegando la mayoría de sub-tareas a otros
 * subcomponentes (TableHeader, TableBody, Overlays, etc.) y hooks (selección, drag).
 *
 * Principios SOLID aplicados:
 * ----------------------------------------------------------------------------------
 *   - SRP (Single Responsibility Principle):
 *       Únicamente orquesta la renderización y maneja sus props. (Sub-tareas separadas)
 *   - DIP (Dependency Inversion Principle):
 *       Todas las dependencias (filtros, callbacks, etc.) se inyectan vía props.
 *
 * REQUISITOS DE LAYOUT:
 * ----------------------------------------------------------------------------------
 *   - Un contenedor padre con altura establecida y `overflow: hidden`.
 *     Así, el scroll ocurre sólo en este componente.
 *
 * Versión:
 * ----------------------------------------------------------------------------------
 *   - 6.1
 *     - Se mantiene "isDarkMode" como prop para alternar color de fila destacada.
 *     - Se restaura el comportamiento de scroll automático al navegar celdas,
 *       usando un `containerRef` propio local (como en la versión anterior).
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';

// Hooks especializados
import useCellSelection from './hooks/useCellSelection';
import useClipboardCopy from './hooks/useClipboardCopy';
import useColumnResize from './hooks/useColumnResize';
import useInlineCellEdit from './hooks/useInlineCellEdit';
import useTableViewContextMenu from './hooks/useTableViewContextMenu';

import {
  initDragListeners,
  handleHeaderMouseDown,
  handleHeaderTouchStart,
  handleRowIndexMouseDown,
  handleRowIndexTouchStart,
} from './logic/dragLogic';

import {
  selectColumnRange,
  selectRowRange,
  selectEntireRow as _selectEntireRow,
  selectEntireColumn as _selectEntireColumn,
  selectAllCells as _selectAllCells,
} from './logic/selectionLogic';

import { getCellsInfo } from './logic/domUtils';
import getSafeDisplayValue from './utils/getSafeDisplayValue';

// Subcomponentes y overlays
import LoadingOverlay from './subcomponents/LoadingOverlay';
import NoResultsOverlay from './subcomponents/NoResultsOverlay';
import TableHeader from './subcomponents/TableHeader';
import TableBody from './subcomponents/TableBody';
import ContextualMenu from './subcomponents/ContextualMenu';
import ColumnFilterPopover from './subcomponents/ColumnFilterPopover';
import Pagination from './subcomponents/Pagination';

// Estilos (clases de selección/copias)
import { SELECTED_CELL_CLASS, COPIED_CELL_CLASS } from './subcomponents/tableViewVisualEffects';

/**
 * @typedef {Object} TableViewProps
 * @property {object}     table                 - Instancia creada por React Table (con filas/columnas).
 * @property {boolean}    loading               - Indica si se está cargando.
 * @property {object}     columnFilters         - Estado de filtros de columnas.
 * @property {Function}   updateColumnFilter    - Func. para actualizar filtros.
 * @property {Array}      columnsDef            - Definición de columnas.
 * @property {Array}      originalColumnsDef    - Def. original de columnas (para resizing).
 * @property {object}     columnWidths          - Mapa con anchos actuales de cada columna.
 * @property {Function}   setColumnWidth        - Callback p/ actualizar ancho de columna.
 * @property {Function}   onHideColumns         - Callback p/ ocultar columnas.
 * @property {Function}   onHideRows            - Callback p/ ocultar filas.
 * @property {Array}      sorting               - Estado de ordenamiento.
 * @property {Function}   toggleSort            - Alternar el ordenamiento.
 * @property {string}     containerHeight       - Alto del contenedor principal (e.g. '400px').
 * @property {number}     rowHeight             - Altura de cada fila en px.
 * @property {string}     loadingText           - Texto mientras carga.
 * @property {string}     noResultsText         - Texto si no hay datos.
 * @property {number}     autoCopyDelay         - Delay para auto-copy en ms.
 * @property {React.Ref}  containerRef          - Referencia opcional (no se usa para el scroll principal).
 * @property {boolean}    isDarkMode            - Indica si el modo oscuro está activo.
 */

/**
 * TableView
 * ----------------------------------------------------------------------------------
 * Orquesta la vista de la tabla + paginación sticky + popovers. Se basa en subcomponentes
 * y hooks para manejar la selección, edición, resize de columnas, etc.
 *
 * NOTA IMPORTANTE:
 *   Se mantiene un `containerRef` propio para garantizar el scroll automático
 *   al navegar o seleccionar celdas con el teclado (comportamiento de la versión 5.x).
 *   El prop `containerRef` sigue existiendo para casos externos, pero no modifica
 *   el contenedor scrolleable donde ocurre la selección.
 *
 * @param {TableViewProps} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export default function TableView({
  table,
  loading,
  columnFilters,
  updateColumnFilter,
  columnsDef,
  originalColumnsDef = [],
  columnWidths,
  setColumnWidth,
  onHideColumns,
  onHideRows,
  sorting,
  toggleSort,
  containerHeight = '400px',
  rowHeight = 15,
  loadingText = 'Cargando datos...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
  // containerRef prop queda disponible, pero no se usa para el scroll local
  containerRef,
  isDarkMode = false,
}) {
  /************************************************************************************
   * [A] Referencia local para el contenedor que maneja el scroll
   *     Se fuerza su uso para el scroll (regresando al comportamiento anterior).
   ************************************************************************************/
  const localContainerRef = useRef(null);

  /************************************************************************************
   * [1] Filas de la tabla
   ************************************************************************************/
  const rows = table.getRowModel().rows;
  const displayedData = rows.map((r) => r.original);

  /************************************************************************************
   * [2] Selección de celdas (useCellSelection)
   ************************************************************************************/
  function _getCellsInfo() {
    return getCellsInfo(localContainerRef, table);
  }
  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(localContainerRef, _getCellsInfo, displayedData, columnsDef, table);

  // Manejo de flechas (↑↓←→) cuando la tabla tiene foco
  useEffect(() => {
    const handleKeyDown = (evt) => {
      // Verificamos que el foco esté dentro del contenedor local
      if (!localContainerRef.current?.contains(document.activeElement)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) {
        handleKeyDownArrowSelection(evt);
      }
    };
    localContainerRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      localContainerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDownArrowSelection]);

  /************************************************************************************
   * [3] Copiado de celdas (useClipboardCopy)
   ************************************************************************************/
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    localContainerRef,
    selectedCells,
    displayedData,
    columnsDef
  );

  /**
   * Copia las celdas seleccionadas al portapapeles en formato TSV.
   * @param {Array} cellsToCopy
   */
  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      // Mapa de rowId -> datos de fila
      const dataMap = new Map();
      rows.forEach((r) => dataMap.set(r.id, r.original));

      // Recorremos las celdas a copiar y las agrupamos por fila
      const rowsMap = new Map();
      cellsToCopy.forEach((cell) => {
        const rowData = dataMap.get(cell.id);
        if (!rowData) return;
        const arr = rowsMap.get(cell.id) || [];
        arr.push(rowData[cell.colField]);
        rowsMap.set(cell.id, arr);
      });

      // Convertimos a TSV
      const tsvLines = [];
      for (const [, rowCells] of rowsMap.entries()) {
        tsvLines.push(rowCells.join('\t'));
      }
      const tsvContent = tsvLines.join('\n');

      await navigator.clipboard.writeText(tsvContent);
      setCopiedCells([...cellsToCopy]);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  /************************************************************************************
   * [4] Edición en línea (useInlineCellEdit)
   ************************************************************************************/
  const {
    editingCell,
    editingValue,
    isEditingCell,
    handleDoubleClick,
    handleChange,
    handleKeyDown: handleEditKeyDown,
    handleBlur,
  } = useInlineCellEdit();

  /************************************************************************************
   * [5] Resize de columnas (useColumnResize)
   ************************************************************************************/
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  /************************************************************************************
   * [6] Menú contextual (clic derecho) - useTableViewContextMenu
   ************************************************************************************/
  const {
    contextMenu,
    clickedHeaderIndex,
    clickedRowIndex,
    handleContextMenu,
    handleCloseContextMenu,
    handleCopyFromMenu,
    handleHideColumn,
    handleHideRow,
  } = useTableViewContextMenu({
    selectedCells,
    doCopyCells,
    onHideColumns,
    onHideRows,
    table,
    rows,
  });

  /************************************************************************************
   * [7] Popover de filtros de columna
   ************************************************************************************/
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuColumnId, setMenuColumnId] = useState(null);

  /**
   * Abre el menú de filtros para la columna clickeada.
   * @param {React.MouseEvent} evt
   * @param {string} columnId
   */
  const handleOpenMenu = (evt, columnId) => {
    evt.stopPropagation();
    setAnchorEl(evt.currentTarget);
    setMenuColumnId(columnId);
  };

  /**
   * Cierra el menú de filtros de columna.
   */
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuColumnId(null);
  };

  /************************************************************************************
   * [8] Arrastre de columnas y filas (dragLogic)
   ************************************************************************************/
  const [isDraggingColumns, setIsDraggingColumns] = useState(false);
  const [startColIndex, setStartColIndex] = useState(null);
  const [isDraggingRows, setIsDraggingRows] = useState(false);
  const [startRowIndex, setStartRowIndex] = useState(null);

  // Estado centralizado para manejar el drag en curso
  const dragStateRef = useRef({
    isDraggingCols: false,
    isDraggingRows: false,
    startColIndex: null,
    startRowIndex: null,
  });

  /**
   * Efecto que inicializa listeners globales para detección de
   * arrastre (drag) en columnas/filas.
   */
  useEffect(() => {
    const cleanup = initDragListeners({
      containerRef: localContainerRef, // <-- uso exclusivo del contenedor local
      setIsDraggingColumns,
      setIsDraggingRows,
      setStartColIndex,
      setStartRowIndex,
      dragStateRef,
      rows,
      selectColumnRangeFn: (stCol, currentIndex) => {
        selectColumnRangeAction(stCol, currentIndex);
      },
      selectRowRangeFn: (stRow, currentRow) => {
        selectRowRangeAction(stRow, currentRow);
      },
    });
    return cleanup;
  }, [rows]);

  /**
   * Handlers para el mousedown/touchstart en los headers
   * (selección de columnas).
   */
  const onHeaderMouseDown = (evt, colIndex, colId) => {
    handleHeaderMouseDown(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);
  };
  const onHeaderTouchStart = (evt, colIndex, colId) => {
    handleHeaderTouchStart(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);
  };

  /**
   * Handlers para el mousedown/touchstart en la columna índice
   * (selección de filas).
   */
  const onRowIndexMouseDown = (evt, rowIndex, rowId) => {
    handleRowIndexMouseDown(evt, rowIndex, rowId, selectEntireRow, dragStateRef, setIsDraggingRows, setStartRowIndex);
  };
  const onRowIndexTouchStart = (evt, rowIndex, rowId) => {
    handleRowIndexTouchStart(evt, rowIndex, rowId, selectEntireRow, dragStateRef, setIsDraggingRows, setStartRowIndex);
  };

  /************************************************************************************
   * [9] Funciones de selección (columnas/filas/rangos)
   ************************************************************************************/
  /**
   * Selección de un rango de columnas (drag).
   * @param {number} start
   * @param {number} end
   */
  function selectColumnRangeAction(start, end) {
    const visibleCols = table.getVisibleFlatColumns();
    const newSelection = selectColumnRange({ rows, visibleCols, start, end });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex: Math.min(start, end) });
    setFocusCell({ rowIndex: 0, colIndex: Math.min(start, end) });
  }

  /**
   * Selección de un rango de filas (drag).
   * @param {number} start
   * @param {number} end
   */
  function selectRowRangeAction(start, end) {
    const visibleCols = table.getVisibleFlatColumns();
    const newSelection = selectRowRange({ rows, visibleCols, start, end });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: Math.min(start, end), colIndex: 1 });
    setFocusCell({ rowIndex: Math.min(start, end), colIndex: 1 });
  }

  /**
   * Selecciona la fila completa dada por rIndex y rowId.
   * @param {number} rIndex
   * @param {string} rowId
   */
  function selectEntireRow(rIndex, rowId) {
    const visibleCols = table.getVisibleFlatColumns();
    const newCells = _selectEntireRow({ rowIndex: rIndex, rowId, visibleCols });
    setSelectedCells(newCells);
    setAnchorCell({ rowIndex: rIndex, colIndex: 1 });
    setFocusCell({ rowIndex: rIndex, colIndex: 1 });
  }

  /**
   * Selecciona la columna completa dada por colIndex y colId.
   * @param {number} colIndex
   * @param {string} colId
   */
  function selectEntireColumn(colIndex, colId) {
    const newSelection = _selectEntireColumn({ rows, colId });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex });
    setFocusCell({ rowIndex: 0, colIndex });
  }

  /**
   * Selecciona todas las celdas de la tabla.
   */
  function selectAllCells() {
    const visibleCols = table.getVisibleFlatColumns();
    const allCells = _selectAllCells({ rows, visibleCols });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  /**
   * Lógica para el click en el header (sin drag): seleccionar
   * la columna entera o la tabla completa si es la columna índice.
   * @param {MouseEvent} evt
   * @param {number} colIndex
   * @param {string} colId
   */
  function handleHeaderClick(evt, colIndex, colId) {
    // Ignoramos el click si es en la manija de resize
    if (evt.target.classList.contains('resize-handle')) return;
    // Selección global si se cliquea la columna índice
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    // Si no, seleccionamos la columna entera
    selectEntireColumn(colIndex, colId);
  }

  /************************************************************************************
   * [10] Resaltar fila actual (cuando se hace click en una celda)
   ************************************************************************************/
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

  function handleCellClick(rIndex) {
    setHighlightedRowIndex(rIndex);
  }

  /************************************************************************************
   * [11] Determinar ancho inicial de columnas (para colgroup)
   ************************************************************************************/
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  /************************************************************************************
   * [12] Render principal
   ************************************************************************************/
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: containerHeight,
        overflow: 'hidden',
      }}
    >
      {/*
        A) Contenedor scrolleable principal.
        Usamos localContainerRef para mantener el scroll y la selección
        con la misma experiencia de la versión anterior.
      */}
      <Box
        ref={localContainerRef}
        onContextMenu={handleContextMenu}
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          userSelect: 'none',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          backgroundColor: 'var(--color-bg-paper)',
          outline: 'none',
          width: '100%',
        }}
        tabIndex={0}
      >
        {/* Overlay de carga */}
        {loading && <LoadingOverlay loadingText={loadingText} />}

        {/* Overlay de "sin resultados" */}
        {!loading && rows.length === 0 && (
          <NoResultsOverlay noResultsText={noResultsText} />
        )}

        {/* TABLA PRINCIPAL */}
        <table className="custom-table" style={{ width: '100%' }}>
          <colgroup>
            {table.getVisibleFlatColumns().map((col, cIndex) => {
              const width = columnWidths[col.id] ?? getColumnDefWidth(col.id);
              const isIndexCol = col.id === '_selectIndex';
              return (
                <col
                  key={col.id}
                  data-colindex={cIndex}
                  style={{
                    width: `${width}px`,
                    backgroundColor: isIndexCol
                      ? 'var(--color-table-index-colgroup)'
                      : 'transparent',
                  }}
                />
              );
            })}
          </colgroup>

          {/* THEAD */}
          <TableHeader
            headerGroups={table.getHeaderGroups()}
            handleHeaderClick={handleHeaderClick}
            onHeaderMouseDown={onHeaderMouseDown}
            onHeaderTouchStart={onHeaderTouchStart}
            handleOpenMenu={handleOpenMenu}
            handleMouseDownResize={handleMouseDownResize}
          />

          {/* TBODY */}
          <TableBody
            rows={rows}
            rowHeight={rowHeight}
            isEditingCell={isEditingCell}
            editingValue={editingValue}
            handleDoubleClick={handleDoubleClick}
            handleChange={handleChange}
            handleEditKeyDown={handleEditKeyDown}
            handleBlur={handleBlur}
            selectedCells={selectedCells}
            copiedCells={copiedCells}
            handleCellClick={handleCellClick}
            onRowIndexMouseDown={onRowIndexMouseDown}
            onRowIndexTouchStart={onRowIndexTouchStart}
            highlightedRowIndex={highlightedRowIndex}

            // ¡Pasamos isDarkMode al cuerpo de la tabla!
            isDarkMode={isDarkMode}
          />
        </table>

        {/* POPUP PARA FILTROS DE COLUMNA */}
        <ColumnFilterPopover
          anchorEl={anchorEl}
          menuColumnId={menuColumnId}
          handleCloseMenu={handleCloseMenu}
          columnFilters={columnFilters}
          updateColumnFilter={updateColumnFilter}
          originalColumnsDef={originalColumnsDef}
        />

        {/* MENÚ CONTEXTUAL (clic derecho) */}
        <ContextualMenu
          contextMenu={contextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          handleCopyFromMenu={handleCopyFromMenu}
          clickedHeaderIndex={clickedHeaderIndex}
          onHideColumns={onHideColumns}
          handleHideColumn={handleHideColumn}
          clickedRowIndex={clickedRowIndex}
          onHideRows={onHideRows}
          handleHideRow={handleHideRow}
        />
      </Box>

      {/*
        B) Barra de paginación sticky al final.
        Se mantiene en la parte inferior (sticky) dentro del contenedor principal.
      */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          backgroundColor: 'var(--color-bg-paper)',
          borderTop: `1px solid var(--color-divider)`,
          zIndex: 10,
          padding: '8px',
        }}
      >
        <Pagination table={table} />
      </Box>
    </Box>
  );
}
