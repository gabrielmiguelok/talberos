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
 *   - 5.5
 *     - Ajustado para leer la función de confirmación de edición desde un contexto,
 *       sin alterar su firma pública.
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';

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

// Subcomponentes
import LoadingOverlay from './subcomponents/LoadingOverlay';
import NoResultsOverlay from './subcomponents/NoResultsOverlay';
import TableHeader from './subcomponents/TableHeader';
import TableBody from './subcomponents/TableBody';
import ContextualMenu from './subcomponents/ContextualMenu';
import ColumnFilterPopover from './subcomponents/ColumnFilterPopover';
import Pagination from './subcomponents/Pagination';

// Estilos/selección
import {
  SELECTED_CELL_CLASS,
  COPIED_CELL_CLASS,
} from './subcomponents/tableViewVisualEffects';

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
}) {
  /************************************************************************************
   * [A] Referencia al contenedor scrolleable
   ************************************************************************************/
  const containerRef = useRef(null);

  /************************************************************************************
   * [1] Filas de la tabla
   ************************************************************************************/
  const rows = table.getRowModel().rows;
  const displayedData = rows.map((r) => r.original);

  /************************************************************************************
   * [2] Selección de celdas (useCellSelection)
   ************************************************************************************/
  function _getCellsInfo() {
    return getCellsInfo(containerRef, table);
  }

  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(containerRef, _getCellsInfo, displayedData, columnsDef, table);

  // Manejo de flechas de teclado (ArrowUp/Down/Left/Right)
  useEffect(() => {
    const handleKeyDown = (evt) => {
      // Verificamos que el foco esté dentro del containerRef
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
   * [3] Copiado (useClipboardCopy)
   ************************************************************************************/
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    displayedData,
    columnsDef
  );

  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      const dataMap = new Map();
      rows.forEach((r) => dataMap.set(r.id, r.original));

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

  /************************************************************************************
   * [4] Edición en línea (useInlineCellEdit)
   * ------------------------------------------------------------------
   * El hook leerá la función "handleConfirmCellEdit" desde el contexto,
   * sin requerir cambios en su firma pública.
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
   * [6] Menú contextual (clic derecho)
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
   * [8] Arrastre de columnas y filas (dragLogic)
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

  useEffect(() => {
    const cleanup = initDragListeners({
      containerRef,
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

  const onHeaderMouseDown = (evt, colIndex, colId) => {
    handleHeaderMouseDown(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);
  };

  const onHeaderTouchStart = (evt, colIndex, colId) => {
    handleHeaderTouchStart(evt, colIndex, colId, dragStateRef, setIsDraggingColumns, setStartColIndex);
  };

  const onRowIndexMouseDown = (evt, rowIndex, rowId) => {
    handleRowIndexMouseDown(evt, rowIndex, rowId, selectEntireRow, dragStateRef, setIsDraggingRows, setStartRowIndex);
  };

  const onRowIndexTouchStart = (evt, rowIndex, rowId) => {
    handleRowIndexTouchStart(evt, rowIndex, rowId, selectEntireRow, dragStateRef, setIsDraggingRows, setStartRowIndex);
  };

  /************************************************************************************
   * [9] Funciones de selección (columnas/filas/rangos)
   ************************************************************************************/
  function selectColumnRangeAction(start, end) {
    const visibleCols = table.getVisibleFlatColumns();
    const newSelection = selectColumnRange({ rows, visibleCols, start, end });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex: Math.min(start, end) });
    setFocusCell({ rowIndex: 0, colIndex: Math.min(start, end) });
  }

  function selectRowRangeAction(start, end) {
    const visibleCols = table.getVisibleFlatColumns();
    const newSelection = selectRowRange({ rows, visibleCols, start, end });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: Math.min(start, end), colIndex: 1 });
    setFocusCell({ rowIndex: Math.min(start, end), colIndex: 1 });
  }

  function selectEntireRow(rIndex, rowId) {
    const visibleCols = table.getVisibleFlatColumns();
    const newCells = _selectEntireRow({ rowIndex: rIndex, rowId, visibleCols });
    setSelectedCells(newCells);
    setAnchorCell({ rowIndex: rIndex, colIndex: 1 });
    setFocusCell({ rowIndex: rIndex, colIndex: 1 });
  }

  function selectEntireColumn(colIndex, colId) {
    const newSelection = _selectEntireColumn({ rows, colId });
    setSelectedCells(newSelection);
    setAnchorCell({ rowIndex: 0, colIndex });
    setFocusCell({ rowIndex: 0, colIndex });
  }

  function selectAllCells() {
    const visibleCols = table.getVisibleFlatColumns();
    const allCells = _selectAllCells({ rows, visibleCols });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  function handleHeaderClick(evt, colIndex, colId) {
    // Evitamos conflicto con el handle del resize
    if (evt.target.classList.contains('resize-handle')) return;
    // Si se hace clic en la columna índice, seleccionamos toda la tabla
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    // Si no, seleccionamos la columna entera
    selectEntireColumn(colIndex, colId);
  }

  /************************************************************************************
   * [10] Resaltar fila actual
   ************************************************************************************/
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);
  function handleCellClick(rIndex) {
    setHighlightedRowIndex(rIndex);
  }

  /************************************************************************************
   * [11] Determinar ancho inicial de columnas
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
      {/* A) CONTENEDOR SCROLLEABLE */}
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
        {/* Loading Overlay */}
        {loading && <LoadingOverlay loadingText={loadingText} />}

        {/* No Results Overlay */}
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

        {/* MENÚ CONTEXTUAL */}
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

      {/* B) BARRA DE PAGINACIÓN (Sticky) */}
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
