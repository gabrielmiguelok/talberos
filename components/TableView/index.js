/************************************************************************************
 * Archivo: /components/registros/TableView/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Este sub-componente se encarga de la VISTA + interacción de la tabla y la barra
 *   de paginación (ambas sticky), incluyendo toda la lógica necesaria para:
 *
 *    1. Selección de celdas (drag, shift-click, flechas) y copiado automático.
 *    2. Menús contextuales (copiar, ocultar columnas/filas).
 *    3. Indicadores de carga (spinner) y de “sin resultados” (overlay).
 *    4. Integración con un hook de edición en línea (useInlineCellEdit).
 *    5. Filtrado por columna (Popover).
 *    6. Redimensionado de columnas (useColumnResize).
 *    7. Scroll y vista “sticky”:
 *       - Cabecera (`<thead>`) con `position: sticky; top: 0;`
 *       - Barra de paginación con `position: sticky; bottom: 0;`
 *
 *   Principios SOLID aplicados:
 *     - SRP (Single Responsibility Principle): Únicamente renderiza la tabla y su interacción.
 *     - DIP (Dependency Inversion Principle): Todas las dependencias (filtros, callbacks, etc.)
 *       se reciben vía props, minimizando acoplamientos rígidos.
 *
 *   REQUISITOS DE LAYOUT:
 *     - Un ancestro con una altura establecida (ej: "100vh", "60vh", etc.)
 *       y `overflow: hidden`, de modo que el **scroll solo ocurra en el
 *       contenedor del componente** (containerRef) y no en toda la página.
 * version 5.4
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

/**
 * getSafeDisplayValue
 * -------------------------------------------------------------------------
 * Convierte un valor a una representación segura en texto/JSX, evitando
 * mostrar "null", "undefined" o "[object Object]".
 *
 * @param {*} val - Valor que se desea representar en la celda.
 * @returns {string|JSX.Element} - Devuelve la representación de texto
 *                                o la misma si es un componente JSX.
 */
function getSafeDisplayValue(val) {
  if (val == null) return '';
  if (typeof val === 'object') {
    // Caso: elemento React (JSX) o un objeto normal
    return val.$$typeof ? val : JSON.stringify(val);
  }
  return String(val);
}

/**
 * TableView
 * -----------------------------------------------------------------------------
 * Componente principal para renderizar la tabla y la paginación sticky.
 * Asegura que solo el contenedor interno (containerRef) maneje el scroll.
 *
 * @param {Object}   props
 * @param {object}   props.table                - Instancia de la tabla (react-table).
 * @param {boolean}  props.loading              - Indicador de carga.
 * @param {object}   props.columnFilters        - Filtros de columna.
 * @param {Function} props.updateColumnFilter   - Actualizador de filtros por columna.
 * @param {Array}    props.columnsDef           - Definición de columnas (visibles).
 * @param {Array}    [props.originalColumnsDef] - Definición original de columnas.
 * @param {object}   props.columnWidths         - Map colId -> width en px.
 * @param {Function} props.setColumnWidth       - Setter de ancho de columna.
 * @param {Function} [props.onHideColumns]      - Callback para ocultar columnas.
 * @param {Function} [props.onHideRows]         - Callback para ocultar filas.
 * @param {object}   props.sorting              - { columnId, direction }.
 * @param {Function} props.toggleSort           - Cambia el ordenamiento.
 * @param {string|number} [props.containerHeight='400px']
 *   Altura del contenedor raíz (ej: "400px", "60vh", etc.).
 *
 * @param {number}   [props.rowHeight=15]
 *   Altura de cada fila, en px. Por defecto 15.
 *
 * @param {string}   [props.loadingText='Cargando datos...']
 *   Texto que se muestra en el overlay cuando loading es true.
 *
 * @param {string}   [props.noResultsText='Sin resultados']
 *   Texto que se muestra si no hay filas que renderizar.
 *
 * @param {number}   [props.autoCopyDelay=1000]
 *   Retardo en milisegundos para el auto-copiado al seleccionar celdas.
 *
 * @returns {JSX.Element}
 */
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

  // Props opcionales nuevas para personalizar
  rowHeight = 15,
  loadingText = 'Cargando datos...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
}) {
  /**
   * Se asume que el contenedor padre no produce scroll a nivel de página (p.e. `height:100vh; overflow:hidden;`)
   * y que TableView tendrá su altura controlada por `containerHeight`.
   */
  const containerRef = useRef(null);

  // --------------------------------------------------------------------------------
  // 1) Datos y filas
  // --------------------------------------------------------------------------------
  const rows = table.getRowModel().rows;
  const displayedData = rows.map((r) => r.original);

  // --------------------------------------------------------------------------------
  // 2) Selección de celdas
  // --------------------------------------------------------------------------------
  /**
   * getCellsInfo:
   * Mapeo DOM de celdas <td data-row="rIndex" data-col="cIndex" /> -> info con rect, rowId, colField
   */
  function getCellsInfo() {
    if (!containerRef.current) return [];
    const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
    const cells = [];
    cellEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const rowIdString = el.getAttribute('data-row');
      const cIndex = parseInt(el.getAttribute('data-col'), 10);

      if (rowIdString == null || isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) {
        return;
      }
      const rowId = rowIdString;
      const colObj = table.getVisibleFlatColumns()[cIndex];
      if (colObj) {
        cells.push({
          id: rowId,
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

  // Lógica y estados para selección de celdas
  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(containerRef, getCellsInfo, displayedData, columnsDef, table);

  // Manejo de flechas de teclado (up, down, left, right)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        handleKeyDownArrowSelection(e);
      }
    };
    containerRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDownArrowSelection]);

  // --------------------------------------------------------------------------------
  // 3) Copiado & auto-copiado
  // --------------------------------------------------------------------------------
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    displayedData,
    columnsDef
  );

  /**
   * doCopyCells:
   * Copia el contenido de las celdas seleccionadas (cellsToCopy) al portapapeles,
   * formateado en TSV (tab-separated values).
   */
  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      const dataMap = new Map();
      rows.forEach((r) => dataMap.set(r.id, r.original));

      // Construir TSV a partir de las celdas
      const rowsMap = new Map();
      cellsToCopy.forEach((cell) => {
        const rowData = dataMap.get(cell.id);
        if (!rowData) return;
        const rowArray = rowsMap.get(cell.id) || [];
        rowArray.push(rowData[cell.colField]);
        rowsMap.set(cell.id, rowArray);
      });

      const tsvLines = [];
      for (const [, rowCells] of rowsMap.entries()) {
        tsvLines.push(rowCells.join('\t'));
      }
      const tsvContent = tsvLines.join('\n');

      await navigator.clipboard.writeText(tsvContent);
      setCopiedCells([...cellsToCopy]);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  }

  // Timer para auto-copiado
  const autoCopyTimerRef = useRef(null);

  // --------------------------------------------------------------------------------
  // 4) Edición en línea (doble click)
  // --------------------------------------------------------------------------------
  const {
    editingCell,
    editingValue,
    isEditingCell,
    handleDoubleClick,
    handleChange,
    handleKeyDown: handleEditKeyDown,
    handleBlur,
  } = useInlineCellEdit();

  // Auto-copiado si hay celdas seleccionadas y no se está editando
  useEffect(() => {
    if (!selectedCells?.length) return;
    if (editingCell) return;

    if (autoCopyTimerRef.current) clearTimeout(autoCopyTimerRef.current);
    autoCopyTimerRef.current = setTimeout(async () => {
      if (!document.hasFocus()) {
        console.warn('[AutoCopy] Documento sin foco, no se copiará.');
        return;
      }
      await doCopyCells(selectedCells);
    }, autoCopyDelay);

    return () => {
      if (autoCopyTimerRef.current) clearTimeout(autoCopyTimerRef.current);
    };
  }, [selectedCells, editingCell, doCopyCells, autoCopyDelay]);

  // --------------------------------------------------------------------------------
  // 5) Resize de columnas
  // --------------------------------------------------------------------------------
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  // --------------------------------------------------------------------------------
  // 6) Menú contextual (copiar, ocultar col/filas)
  // --------------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------------
  // 7) Popover de filtros por columna
  // --------------------------------------------------------------------------------
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuColumnId, setMenuColumnId] = useState(null);

  const handleOpenMenu = (event, columnId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuColumnId(columnId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuColumnId(null);
  };

  // --------------------------------------------------------------------------------
  // 8) Arrastre de columnas/filas completas
  // --------------------------------------------------------------------------------
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

  /**
   * handleHeaderMouseDown:
   * Inicia el proceso de arrastre de columnas si no se está haciendo un resize.
   */
  const handleHeaderMouseDown = (e, colIndex, colId) => {
    // Evitar resizing si clic en la manija
    if (e.target.classList.contains('resize-handle')) return;
    // Evitar arrastrar la columna de índice
    if (colId === '_selectIndex') return;

    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  };

  const handleHeaderTouchStart = (e, colIndex, colId) => {
    if (colId === '_selectIndex') return;
    if (e.target.classList.contains('resize-handle')) return;
    if (e.touches.length === 1) {
      dragStateRef.current.isDraggingCols = true;
      dragStateRef.current.startColIndex = colIndex;
      setIsDraggingColumns(true);
      setStartColIndex(colIndex);
    }
  };

  /**
   * handleRowIndexMouseDown:
   * Selecciona la fila completa y habilita arrastrar filas si se mantiene presionado.
   */
  const handleRowIndexMouseDown = (e, rowIndex, rowId) => {
    e.stopPropagation();
    e.preventDefault();
    selectEntireRow(rowIndex, rowId);
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  };

  const handleRowIndexTouchStart = (e, rowIndex, rowId) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.touches.length === 1) {
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
     * Lógica para detectar en qué columna/fila estamos mientras se arrastra,
     * y realizar la selección de rango correspondiente.
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
        const rowIndexCells = containerRef.current.querySelectorAll(
          'tbody tr td[data-col="0"]'
        );
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

    const handleMouseMove = (e) => {
      if (!dragStateRef.current.isDraggingCols && !dragStateRef.current.isDraggingRows) {
        return;
      }
      handlePointerMove(e.clientX, e.clientY, e);
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

    const handleTouchMove = (e) => {
      if (!dragStateRef.current.isDraggingCols && !dragStateRef.current.isDraggingRows) {
        return;
      }
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY, e);
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
   * - Si se hace clic normal en la cabecera de una columna (no en la manija de resize),
   *   selecciona toda la columna.
   * - Si la columna es la de índice (`_selectIndex`), se seleccionan todas las celdas de la tabla.
   */
  const handleHeaderClick = (e, colIndex, colId) => {
    if (e.target.classList.contains('resize-handle')) return;
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    selectEntireColumn(colIndex, colId);
  };

  // --------------------------------------------------------------------------------
  // 9) Funciones de selección extra (columnas/filas completas, rango, todo)
  // --------------------------------------------------------------------------------
  function selectColumnRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelected = [];
    rows.forEach((row) => {
      const rowId = row.id;
      for (let c = min; c <= max; c++) {
        if (visibleCols[c]?.id === '_selectIndex') continue;
        newSelected.push({ id: rowId, colField: visibleCols[c].id });
      }
    });
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: 0, colIndex: min });
    setFocusCell({ rowIndex: 0, colIndex: min });
  }

  function selectRowRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelected = [];
    for (let r = min; r <= max; r++) {
      const row = rows[r];
      if (!row) continue;
      for (let c = 0; c < visibleCols.length; c++) {
        if (visibleCols[c].id === '_selectIndex') continue;
        newSelected.push({ id: row.id, colField: visibleCols[c].id });
      }
    }
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: min, colIndex: 1 });
    setFocusCell({ rowIndex: min, colIndex: 1 });
  }

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
    const newSelected = [];
    rows.forEach((row) => {
      newSelected.push({ id: row.id, colField: colId });
    });
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: 0, colIndex: colIndex });
    setFocusCell({ rowIndex: 0, colIndex: colIndex });
  }

  function selectAllCells() {
    const allCells = [];
    const visibleCols = table.getVisibleFlatColumns();
    rows.forEach((row) => {
      visibleCols.forEach((col) => {
        if (col.id !== '_selectIndex') {
          allCells.push({ id: row.id, colField: col.id });
        }
      });
    });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  // --------------------------------------------------------------------------------
  // 10) Resaltar fila actual (por clic en una celda)
  // --------------------------------------------------------------------------------
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

  /**
   * handleCellClick:
   * Actualiza la fila resaltada (destacada visualmente).
   */
  const handleCellClick = (rowIndex) => {
    setHighlightedRowIndex(rowIndex);
  };

  // --------------------------------------------------------------------------------
  // 11) Determinar ancho inicial de columnas
  // --------------------------------------------------------------------------------
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  // --------------------------------------------------------------------------------
  // Render principal
  // --------------------------------------------------------------------------------
  return (
    <Box
      /**
       * Contenedor raíz con altura configurable mediante containerHeight.
       * El scroll se maneja dentro de containerRef (flex: 1; overflow: 'auto').
       */
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: containerHeight,
        overflow: 'hidden',
      }}
    >
      {/* Contenedor SCROLLEABLE de la tabla */}
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
        {/* Overlay de “cargando” */}
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

        {/* Overlay de “sin resultados” */}
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

        {/* Tabla HTML */}
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

          {/* THEAD sticky */}
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
                              <FilterListIcon
                                fontSize="inherit"
                                style={{ fontSize: '14px' }}
                              />
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

          {/* TBODY (filas) */}
          <tbody>
            {rows.map((row, rIndex) => {
              const rowId = row.id;
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

                    // Determinar si la celda está seleccionada o ha sido copiada
                    const isSelected = selectedCells.some(
                      (sc) => sc.id === rowId && sc.colField === colId
                    );
                    const isCopied = copiedCells.some(
                      (cc) => cc.id === rowId && cc.colField === colId
                    );

                    // ¿Edición en línea activa?
                    const inEditingMode = isEditingCell(rowId, colId);
                    const rawValue = cell.getValue();
                    // Render custom si la columna define su propio "cell",
                    // de lo contrario, usamos el valor crudo.
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
                        data-row={rIndex}
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
                          if (isIndexCol) {
                            handleRowIndexMouseDown(evt, rIndex, rowId);
                          }
                        }}
                        onTouchStart={(evt) => {
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

        {/* Popover para filtros por columna */}
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

        {/* Menú contextual (copiar, ocultar col/filas) */}
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

      {/* Barra de paginación sticky */}
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
