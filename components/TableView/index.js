/************************************************************************************
 * Archivo: /components/registros/TableView/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * ----------------------------------------------------------------------------------
 * Este sub-componente se encarga de la VISTA + interacción de la tabla y la barra
 * de paginación (ambas sticky), incluyendo toda la lógica necesaria para:
 *
 *   1. Selección de celdas (drag, shift-click, flechas) y copiado automático.
 *   2. Menús contextuales (copiar, ocultar columnas/filas).
 *   3. Indicadores de carga (spinner) y de “sin resultados” (overlay).
 *   4. Integración con un hook de edición en línea (useInlineCellEdit).
 *   5. Filtrado por columna (Popover).
 *   6. Redimensionado de columnas (useColumnResize).
 *   7. Scroll y vista “sticky”:
 *       - Cabecera (`<thead>`) con `position: sticky; top: 0;`
 *       - Barra de paginación con `position: sticky; bottom: 0;`
 *
 * Principios SOLID aplicados:
 * ----------------------------------------------------------------------------------
 *   - SRP (Single Responsibility Principle):
 *       Únicamente renderiza la tabla y maneja su interacción (selección, menú contextual, etc.)
 *   - DIP (Dependency Inversion Principle):
 *       Todas las dependencias (filtros, callbacks, etc.) se reciben vía props, minimizando
 *       acoplamientos rígidos.
 *
 * REQUISITOS DE LAYOUT:
 * ----------------------------------------------------------------------------------
 *   - Un contenedor padre con una altura establecida (ej: "100vh" o "60vh")
 *     y `overflow: hidden`, para que el **scroll ocurra sólo en este componente**.
 *
 * Versión:
 * ----------------------------------------------------------------------------------
 *   - 5.4
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Popover,
  Menu,
  MenuItem,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

// Hooks personalizados
import useCellSelection from '../hooks/useCellSelection';
import useClipboardCopy from '../hooks/useClipboardCopy';
import useColumnResize from '../hooks/useColumnResize';
import useInlineCellEdit from '../hooks/useInlineCellEdit';
import useTableViewContextMenu from './contextMenu/useTableViewContextMenu';

// Componentes relacionados
import ColumnFilterConfiguration from '../ColumnConfiguration';
import Pagination from './Pagination';

// Constantes y utilidades para estilos/selección
import {
  SELECTED_CELL_CLASS,
  COPIED_CELL_CLASS,
} from '../tableViewVisualEffects';

/************************************************************************************
 * getSafeDisplayValue
 * ----------------------------------------------------------------------------------
 * Convierte cualquier valor en una representación segura y legible en texto/JSX:
 *   - Null/Undefined => '' (cadena vacía).
 *   - Objeto React (JSX) => retornarlo tal cual.
 *   - Objeto normal => JSON.stringify(val).
 *   - Cualquier otro tipo => String(valor).
 *
 * @param {*} val - El valor a representar en la celda.
 * @returns {string|JSX.Element}
 ************************************************************************************/
function getSafeDisplayValue(val) {
  if (val == null) return '';
  if (typeof val === 'object') {
    // Caso: elemento React (JSX) o un objeto JS
    return val.$$typeof ? val : JSON.stringify(val);
  }
  return String(val);
}

/************************************************************************************
 * TableView
 * ----------------------------------------------------------------------------------
 * Componente principal para renderizar la tabla y la paginación sticky.
 *
 * PROPS:
 *   - table: Instancia de la tabla (react-table).
 *   - loading: Booleano, muestra spinner si true.
 *   - columnFilters, updateColumnFilter: Filtros de columna y su setter.
 *   - columnsDef: Definición de columnas visibles.
 *   - originalColumnsDef: Definición original de columnas (opcional).
 *   - columnWidths, setColumnWidth: Mapa colId -> ancho px, y su setter.
 *   - onHideColumns, onHideRows: Callbacks para ocultar columnas/filas (opcionales).
 *   - sorting, toggleSort: Estado de ordenamiento y callback para cambiar sort.
 *   - containerHeight: Altura del contenedor raíz (string|number).
 *   - rowHeight: Altura de cada fila en px.
 *   - loadingText: Texto a mostrar si loading=true.
 *   - noResultsText: Texto a mostrar si no hay filas.
 *   - autoCopyDelay: Retardo (ms) para auto-copiado de celdas seleccionadas.
 *
 * RETORNA: JSX.Element
 ************************************************************************************/
export default function TableView({
  // Props requeridas
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

  // Props opcionales de personalización
  rowHeight = 15,
  loadingText = 'Cargando datos...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
}) {
  /**
   * [A] REFERENCIA AL CONTENEDOR SCROLLEABLE
   * --------------------------------------------------------
   * Se asume que el padre (wrapper) no produce scroll en toda la página,
   * sino que este contenedor maneja su propio scroll interno.
   */
  const containerRef = useRef(null);

  /************************************************************************************
   * [1] DATOS Y FILAS
   ************************************************************************************/
  const rows = table.getRowModel().rows;
  const displayedData = rows.map((r) => r.original);

  /************************************************************************************
   * [2] SELECCIÓN DE CELDAS (HOOK useCellSelection)
   ************************************************************************************/

  /**
   * getCellsInfo:
   * -----------------------------------------------------------------------------
   * Lee el DOM para cada <td data-row="rowId" data-col="cIndex" />,
   * recuperando posición (x, y, width, height) + rowId + colField.
   *
   * NOTA:
   *  - Aseguramos que data-row contenga el ID real de la fila (row.id), no simplemente
   *    un índice. De esta forma, la selección funciona coherentemente con `useCellSelection`.
   */
  function getCellsInfo() {
    if (!containerRef.current) return [];
    const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
    const cells = [];

    cellEls.forEach((el) => {
      const rect = el.getBoundingClientRect();

      // rowIdString es el row.id (string) que inyectamos en data-row
      const rowIdString = el.getAttribute('data-row');
      const cIndex = parseInt(el.getAttribute('data-col'), 10);

      if (!rowIdString || isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) {
        return;
      }
      const colObj = table.getVisibleFlatColumns()[cIndex];
      if (colObj) {
        cells.push({
          id: rowIdString, // Este es el ID real de la fila
          colField: colObj.id,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    });
    return cells;
  }

  // Instancia del hook para selección de celdas
  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(containerRef, getCellsInfo, displayedData, columnsDef, table);

  // Manejo de flechas de teclado
  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) {
        handleKeyDownArrowSelection(evt);
      }
    };
    containerRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDownArrowSelection]);

  /************************************************************************************
   * [3] HOOK DE COPIADO (useClipboardCopy)
   ************************************************************************************/
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    displayedData,
    columnsDef
  );

  /**
   * doCopyCells:
   * Copia las celdas seleccionadas al portapapeles en formato TSV (Tab-Separated Values).
   */
  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      // Mapeo row.id => row.original
      const dataMap = new Map();
      rows.forEach((r) => dataMap.set(r.id, r.original));

      // Armar TSV
      const rowsMap = new Map();
      cellsToCopy.forEach((cell) => {
        const rowData = dataMap.get(cell.id);
        if (!rowData) return;
        const arr = rowsMap.get(cell.id) || [];
        arr.push(rowData[cell.colField]);
        rowsMap.set(cell.id, arr);
      });

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

  const autoCopyTimerRef = useRef(null);

  /************************************************************************************
   * [4] EDICIÓN EN LÍNEA (HOOK useInlineCellEdit)
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
   * [5] RESIZE DE COLUMNAS (useColumnResize)
   ************************************************************************************/
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  /************************************************************************************
   * [6] MENÚ CONTEXTUAL (copiar/ocultar col/filas)
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
   * [7] POPOVER DE FILTROS POR COLUMNA
   ************************************************************************************/
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuColumnId, setMenuColumnId] = useState(null);

  const handleOpenMenu = (evt, columnId) => {
    evt.stopPropagation();
    setAnchorEl(evt.currentTarget);
    setMenuColumnId(columnId);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuColumnId(null);
  };

  /************************************************************************************
   * [8] ARRASTRE DE COLUMNAS Y FILAS COMPLETAS
   ************************************************************************************/
  const [isDraggingColumns, setIsDraggingColumns] = useState(false);
  const [startColIndex, setStartColIndex] = useState(null);
  const [isDraggingRows, setIsDraggingRows] = useState(false);
  const [startRowIndex, setStartRowIndex] = useState(null);

  const dragStateRef = useRef({
    isDraggingCols: false,
    isDraggingRows: false,
    startColIndex: null,
    startRowIndex: null,
  });

  // Disparadores para arrastrar columnas
  const handleHeaderMouseDown = (evt, colIndex, colId) => {
    if (evt.target.classList.contains('resize-handle')) return; // Evitar colisión con Resize
    if (colId === '_selectIndex') return; // No arrastrar la col índice
    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  };
  const handleHeaderTouchStart = (evt, colIndex, colId) => {
    if (colId === '_selectIndex') return;
    if (evt.target.classList.contains('resize-handle')) return;
    if (evt.touches.length === 1) {
      dragStateRef.current.isDraggingCols = true;
      dragStateRef.current.startColIndex = colIndex;
      setIsDraggingColumns(true);
      setStartColIndex(colIndex);
    }
  };

  // Disparadores para arrastrar filas (clic en la col índice)
  const handleRowIndexMouseDown = (evt, rowIndex, rowId) => {
    evt.stopPropagation();
    evt.preventDefault();
    selectEntireRow(rowIndex, rowId);
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  };
  const handleRowIndexTouchStart = (evt, rowIndex, rowId) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (evt.touches.length === 1) {
      selectEntireRow(rowIndex, rowId);
      dragStateRef.current.isDraggingRows = true;
      dragStateRef.current.startRowIndex = rowIndex;
      setIsDraggingRows(true);
      setStartRowIndex(rowIndex);
    }
  };

  useEffect(() => {
    /**
     * handlePointerMove:
     * Selecciona dinámicamente columnas/filas mientras se arrastra el puntero.
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
          selectColumnRange(stCol, currentIndex);
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
          selectRowRange(stRow, currentRow);
        }
      }
    };

    const handleMouseMove = (evt) => {
      if (!dragStateRef.current.isDraggingCols && !dragStateRef.current.isDraggingRows) {
        return;
      }
      handlePointerMove(evt.clientX, evt.clientY, evt);
    };
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

    const handleTouchMove = (evt) => {
      if (!dragStateRef.current.isDraggingCols && !dragStateRef.current.isDraggingRows) {
        return;
      }
      if (evt.touches.length === 1) {
        const touch = evt.touches[0];
        handlePointerMove(touch.clientX, touch.clientY, evt);
      }
    };
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

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [rows]);

  /**
   * handleHeaderClick:
   * -----------------------------------------------------------------------------
   * - Si se hace clic normal en la cabecera de una columna (no en la manija de resize),
   *   selecciona toda la columna.
   * - Si la columna es la de índice (_selectIndex), selecciona toda la tabla.
   */
  const handleHeaderClick = (evt, colIndex, colId) => {
    if (evt.target.classList.contains('resize-handle')) return;
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    selectEntireColumn(colIndex, colId);
  };

  /************************************************************************************
   * [9] FUNCIONES PARA SELECCIONAR COLUMNAS / FILAS COMPLETAS O RANGOS
   ************************************************************************************/
  function selectColumnRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelection = [];
    rows.forEach((r) => {
      for (let c = min; c <= max; c++) {
        const col = visibleCols[c];
        if (!col || col.id === '_selectIndex') continue;
        newSelection.push({ id: r.id, colField: col.id });
      }
    });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex: min });
    setFocusCell({ rowIndex: 0, colIndex: min });
  }

  function selectRowRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
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
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: min, colIndex: 1 });
    setFocusCell({ rowIndex: min, colIndex: 1 });
  }

  /**
   * selectEntireRow(rIndex, rowId):
   * -----------------------------------------------------------------------------
   * Selecciona todas las celdas de la fila (excepto la col índice).
   * rowIndex nos sirve para anchorCell/focusCell, rowId para la selección real.
   */
  function selectEntireRow(rIndex, rowId) {
    const visibleCols = table.getVisibleFlatColumns();
    const newCells = visibleCols
      .filter((c) => c.id !== '_selectIndex')
      .map((c) => ({ id: rowId, colField: c.id }));

    setSelectedCells(newCells);
    setAnchorCell({ rowIndex: rIndex, colIndex: 1 });
    setFocusCell({ rowIndex: rIndex, colIndex: 1 });
  }

  function selectEntireColumn(colIndex, colId) {
    const newSelection = [];
    rows.forEach((r) => {
      newSelection.push({ id: r.id, colField: colId });
    });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex });
    setFocusCell({ rowIndex: 0, colIndex });
  }

  function selectAllCells() {
    const allCells = [];
    const visibleCols = table.getVisibleFlatColumns();
    rows.forEach((r) => {
      visibleCols.forEach((col) => {
        if (col.id !== '_selectIndex') {
          allCells.push({ id: r.id, colField: col.id });
        }
      });
    });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  /************************************************************************************
   * [10] RESALTAR FILA ACTUAL (POR CLIC EN CUALQUIER CELDA)
   ************************************************************************************/
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

  const handleCellClick = (rIndex) => {
    setHighlightedRowIndex(rIndex);
  };

  /************************************************************************************
   * [11] DETERMINAR ANCHO INICIAL DE COLUMNAS
   ************************************************************************************/
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  /************************************************************************************
   * [12] RENDER PRINCIPAL
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
      {/***********************************************************************
       * [A] CONTENEDOR SCROLLEABLE DE LA TABLA (REF => containerRef)
       ***********************************************************************/}
      <Box
        ref={containerRef}
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
        {/*******************************************************************
         * OVERLAY DE “CARGANDO” (Spinner + texto)
         ******************************************************************/}
        {loading && (
          <Box
            sx={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--color-text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-bg-paper)',
              zIndex: 9999,
            }}
          >
            <CircularProgress sx={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {loadingText}
            </Typography>
          </Box>
        )}

        {/*******************************************************************
         * OVERLAY DE “SIN RESULTADOS”
         ******************************************************************/}
        {!loading && rows.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--color-text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-bg-paper)',
              zIndex: 9999,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {noResultsText}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Modifica los filtros o la búsqueda para ver más resultados.
            </Typography>
          </Box>
        )}

        {/*******************************************************************
         * TABLA PRINCIPAL (HTML)
         ******************************************************************/}
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

          {/*****************************************************************
           * THEAD (Sticky) => Cabecera
           *****************************************************************/}
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'var(--color-bg-paper)',
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
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
                      onClick={(e) => handleHeaderClick(e, hIndex, colId)}
                      onMouseDown={(e) => handleHeaderMouseDown(e, hIndex, colId)}
                      onTouchStart={(e) => handleHeaderTouchStart(e, hIndex, colId)}
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

          {/*****************************************************************
           * TBODY => Filas
           *****************************************************************/}
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
                          table,
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
                            handleRowIndexMouseDown(evt, rIndex, rowId);
                          }
                        }}
                        onTouchStart={(evt) => {
                          // Si es la col índice, iniciamos arrastre de fila
                          if (isIndexCol && evt.touches.length === 1) {
                            handleRowIndexTouchStart(evt, rIndex, rowId);
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
        </table>

        {/*******************************************************************
         * POPOVER PARA CONFIGURAR FILTROS DE COLUMNA
         ******************************************************************/}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <ColumnFilterConfiguration
            menuColumnId={menuColumnId}
            columnFilters={columnFilters}
            updateColumnFilter={updateColumnFilter}
            originalColumnsDef={originalColumnsDef}
          />
        </Popover>

        {/*******************************************************************
         * MENÚ CONTEXTUAL => COPIAR / OCULTAR FILAS O COLUMNAS
         ******************************************************************/}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleCopyFromMenu}>Copiar</MenuItem>
          {onHideColumns && clickedHeaderIndex != null && (
            <MenuItem onClick={handleHideColumn}>Ocultar columna</MenuItem>
          )}
          {onHideRows && clickedRowIndex != null && (
            <MenuItem onClick={handleHideRow}>Ocultar fila</MenuItem>
          )}
        </Menu>
      </Box>

      {/***********************************************************************
       * [B] BARRA DE PAGINACIÓN (Sticky, en el bottom)
       ***********************************************************************/}
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
