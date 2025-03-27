/************************************************************************************
 * LOCATION: /components/registros/TableView/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Este sub-componente se encarga de renderizar la tabla HTML principal,
 *   incluyendo:
 *    - Selección de celdas (con drag, shift-click, etc.).
 *    - Selección arrastrando en la cabecera (horizontal) o en la primera
 *      columna (vertical).
 *    - Menús contextuales (para copiar/ocultar columnas/filas).
 *    - Indicadores de carga y “sin resultados”.
 *    - Integración con un hook de edición en línea (useInlineCellEdit).
 *    - Manejo del copiado para evitar el error "Document not focused" y
 *      omitir copia cuando se está editando una celda.
 *    - Formateo de valores para no mostrar "null" o "[object Object]" en pantalla.
 *
 *   Principios SOLID:
 *    - SRP (Responsabilidad Única): Se encarga del render puro de la tabla y la
 *      lógica asociada a la selección/copiado/menús en la interfaz.
 *    - DIP: Recibe la definición de columnas y las funciones de filtrado mediante props.
 *
 * @version 3.2
 ************************************************************************************/

import React, { useRef, useState, useEffect } from 'react';
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
import useClipboardCopy from '../hooks/useClipboardCopy';
import useColumnResize from '../hooks/useColumnResize';
import useInlineCellEdit from '../hooks/useInlineCellEdit';
// >>> IMPORTA EL HOOK DEL MENÚ CONTEXTUAL <<<
import useTableViewContextMenu from './contextMenu/useTableViewContextMenu';

// Componentes relacionados
import ColumnFilterConfiguration from '../ColumnConfiguration';

// Utilidades y constantes
import {
  SELECTED_CELL_CLASS,
  COPIED_CELL_CLASS,
} from '../tableViewVisualEffects';

// Constantes internas
const ROW_HEIGHT = 20;
const LOADING_TEXT = 'Cargando datos...';
const NO_RESULTS_TEXT = 'Sin resultados';
const AUTO_COPY_DELAY = 1000;

/**
 * safeDisplayValue
 *  - Convierte un valor a una representación segura en texto, evitando mostrar null
 *    o [object Object].
 *  - Si es un elemento React, se retorna tal cual.
 *  - Si es un objeto, se hace JSON.stringify.
 *
 * @param {*} val - Valor a formatear.
 * @returns {string|JSX.Element} - Cadena de texto o elemento React seguro.
 */
function safeDisplayValue(val) {
  if (val == null) return '';
  if (typeof val === 'object') {
    // Podría ser un elemento React (comprobación: val.$$typeof)
    if (val.$$typeof) {
      return val; // Retornarlo tal cual, es JSX
    }
    return JSON.stringify(val); // Objeto genérico => JSON
  }
  return String(val);
}

/**
 * TableView
 *  - Componente principal para renderizar la tabla HTML con:
 *      • Selección de celdas (drag, shift-click, etc.).
 *      • Menú contextual (copiar, ocultar columnas/filas).
 *      • Indicadores de carga y sin resultados.
 *      • Edición en línea de celdas.
 *      • Filtrado por columna (con un Popover que abre un configurador).
 *      • Lógica de redimensionado de columnas.
 *      • Manejo del copiado (auto-copy y Ctrl+C manual).
 *
 * @param {object} props.table              - Instancia de la tabla (react-table).
 * @param {Array} props.selectedCells       - Lista de celdas seleccionadas ({id, colField}).
 * @param {Function} props.setSelectedCells - Setter para la selección de celdas.
 * @param {boolean} props.loading           - Indica si los datos están cargando.
 * @param {object} props.anchorCell         - Celda “ancla” de la selección.
 * @param {object} props.focusCell          - Celda en foco dentro de la selección.
 * @param {Function} props.setAnchorCell    - Setter para la celda ancla.
 * @param {Function} props.setFocusCell     - Setter para la celda con foco.
 * @param {object} props.columnFilters      - Filtros por columna.
 * @param {Function} props.updateColumnFilter - Actualizador de filtro por columna.
 * @param {Array} props.columnsDef          - Definición de columnas.
 * @param {Array} [props.originalColumnsDef=[]] - Definición original de columnas.
 * @param {object} props.columnWidths       - Ancho de cada columna (colId -> width).
 * @param {Function} props.setColumnWidth   - Setter para asignar ancho a una columna.
 * @param {object} props.containerRef       - Referencia al contenedor principal de la tabla.
 * @param {Function} [props.onHideColumns]  - Callback para ocultar columnas.
 * @param {Function} [props.onHideRows]     - Callback para ocultar filas.
 * @param {object} props.sorting            - Estado de ordenamiento ({ columnId, direction }).
 * @param {Function} props.toggleSort       - Función para cambiar el ordenamiento.
 *
 * @returns {JSX.Element}
 */
export default function TableView({
  table,
  selectedCells,
  setSelectedCells,
  loading,
  anchorCell,
  focusCell,
  setAnchorCell,
  setFocusCell,
  columnFilters,
  updateColumnFilter,
  columnsDef,
  originalColumnsDef = [],
  columnWidths,
  setColumnWidth,
  containerRef,
  onHideColumns,
  onHideRows,
  sorting,
  toggleSort,
}) {
  // Filas ya procesadas por React Table (paginación, filtrado, etc.).
  const rows = table.getRowModel().rows;
  // Data completa (si fuese necesario para copiado, etc.).
  const data = table.options.data || [];

  /**
   * Hook personalizado para manejar el copiado de celdas (Ctrl + C).
   * Devuelve { copiedCells, setCopiedCells } para marcar visualmente celdas copiadas.
   */
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    data,
    columnsDef
  );

  /**
   * Hook para manejar la lógica de redimensionado de columnas.
   * Retorna handleMouseDownResize => fn(evt, colId).
   */
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  /**
   * Hook de edición en línea de celdas.
   * Retorna props/fns: editingCell, editingValue, isEditingCell, handleDoubleClick, handleChange, handleKeyDown, handleBlur.
   */
  const {
    editingCell,
    editingValue,
    isEditingCell,
    handleDoubleClick,
    handleChange,
    handleKeyDown,
    handleBlur,
  } = useInlineCellEdit();

  // --------------------------------------------------------------------------
  // Popover para la configuración de filtros en cada columna (botón de filtro).
  // --------------------------------------------------------------------------
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuColumnId, setMenuColumnId] = useState(null);

  const handleOpenMenu = (event, columnId) => {
    setAnchorEl(event.currentTarget);
    setMenuColumnId(columnId);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuColumnId(null);
  };

  // --------------------------------------------------------------------------
  // Lógica del Menú Contextual (lo movemos a un hook especializado).
  // --------------------------------------------------------------------------

  /**
   * doCopyCells
   *  - Copia un conjunto de celdas en formato TSV al portapapeles
   *    y marca visualmente las celdas copiadas.
   */
  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      // Se mapea rowIndex => rowData original
      const dataMap = new Map();
      rows.forEach((r) => {
        dataMap.set(r.id, r.original);
      });

      // Agrupamos datos por fila
      const rowsMap = new Map();
      cellsToCopy.forEach((cell) => {
        const rowData = dataMap.get(cell.id);
        if (!rowData) return;
        const rowArray = rowsMap.get(cell.id) || [];
        rowArray.push(rowData[cell.colField]);
        rowsMap.set(cell.id, rowArray);
      });

      // Convertir a TSV
      const tsvLines = [];
      for (const [, rowCells] of rowsMap.entries()) {
        tsvLines.push(rowCells.join('\t'));
      }
      const tsvContent = tsvLines.join('\n');

      // Copiar al portapapeles
      await navigator.clipboard.writeText(tsvContent);
      setCopiedCells([...cellsToCopy]);
    } catch (error) {
      console.error('Error copiando:', error);
    }
  }

  // Hook que encapsula TODA la lógica del menú contextual
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
    doCopyCells,        // Pasamos la función para copiar celdas
    onHideColumns,
    onHideRows,
    table,
    rows,
  });

  // --------------------------------------------------------------------------
  // Lógica de arrastre para selección de columnas y filas.
  // --------------------------------------------------------------------------
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
   * handleHeaderMouseDown
   *  - Inicia la selección por arrastre desde la cabecera (vertical).
   */
  const handleHeaderMouseDown = (e, colIndex, colId) => {
    // Si el objetivo es el "handle" de resize, no hacemos selección
    if (e.target.classList.contains('resize-handle')) return;
    // Si es la columna índice, no hacemos selección por arrastre
    if (colId === '_selectIndex') return;

    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  };

  /**
   * handleRowIndexMouseDown
   *  - Inicia la selección por arrastre desde la primera columna (horizontal).
   */
  const handleRowIndexMouseDown = (e, rowIndex, rowId) => {
    e.stopPropagation();
    e.preventDefault();
    // Selecciona la fila completa en el "mousedown"
    selectEntireRow(rowIndex, rowId);
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  };

  // useEffect para escuchar mousemove/mouseup global y concretar la selección “drag”.
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { isDraggingCols, isDraggingRows, startColIndex, startRowIndex } =
        dragStateRef.current;

      if (!containerRef.current) return;

      // Arrastre de columnas (cabecera)
      if (isDraggingCols) {
        const colEls = containerRef.current.querySelectorAll(
          'thead tr:first-child th'
        );
        let currentIndex = null;
        colEls.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            currentIndex = i;
          }
        });
        if (currentIndex != null) {
          selectColumnRange(startColIndex, currentIndex);
        }
      }
      // Arrastre de filas (columna índice)
      else if (isDraggingRows) {
        const rowIndexCells = containerRef.current.querySelectorAll(
          'tbody tr td[data-col="0"]'
        );
        let currentRow = null;
        rowIndexCells.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            currentRow = i;
          }
        });
        if (currentRow != null) {
          selectRowRange(startRowIndex, currentRow);
        }
      }
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef]);

  // --------------------------------------------------------------------------
  // Manejo de clic en el header (seleccionar columna completa o toda la tabla).
  // --------------------------------------------------------------------------
  const handleHeaderClick = (e, colIndex, colId) => {
    // Si es el "handle" de resize, no hacemos nada
    if (e.target.classList.contains('resize-handle')) return;
    // Si es la columna índice, selecciona toda la tabla
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    // De lo contrario, selecciona la columna completa
    selectEntireColumn(colIndex, colId);
  };

  /**
   * selectColumnRange
   *  - Selecciona un rango de columnas [start, end] para TODAS las filas visibles.
   */
  function selectColumnRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelected = [];

    rows.forEach((row) => {
      const rowIndex = row.id;
      for (let c = min; c <= max; c++) {
        if (visibleCols[c].id === '_selectIndex') continue;
        newSelected.push({ id: rowIndex, colField: visibleCols[c].id });
      }
    });
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: 0, colIndex: min });
    setFocusCell({ rowIndex: 0, colIndex: min });
  }

  /**
   * selectRowRange
   *  - Selecciona un rango de filas [start, end] para TODAS las columnas visibles.
   */
  function selectRowRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelected = [];

    for (let r = min; r <= max; r++) {
      const row = rows[r];
      if (!row) continue;
      const rowIndex = row.id;
      for (let c = 0; c < visibleCols.length; c++) {
        if (visibleCols[c].id === '_selectIndex') continue;
        newSelected.push({ id: rowIndex, colField: visibleCols[c].id });
      }
    }
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: min, colIndex: 1 });
    setFocusCell({ rowIndex: min, colIndex: 1 });
  }

  /**
   * selectEntireRow
   *  - Selecciona TODAS las columnas de una fila dada (índice rIndex).
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

  /**
   * selectEntireColumn
   *  - Selecciona TODAS las filas de una columna dada (colId).
   */
  function selectEntireColumn(colIndex, colId) {
    const newSelected = [];
    rows.forEach((row) => {
      newSelected.push({ id: row.id, colField: colId });
    });
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: 0, colIndex });
    setFocusCell({ rowIndex: 0, colIndex });
  }

  /**
   * selectAllCells
   *  - Selecciona todas las celdas de la tabla (excepto la columna índice).
   */
  function selectAllCells() {
    const allCells = [];
    const visibleCols = table.getVisibleFlatColumns();
    rows.forEach((row) => {
      const rowIndex = row.id;
      visibleCols.forEach((col) => {
        if (col.id === '_selectIndex') return;
        allCells.push({ id: rowIndex, colField: col.id });
      });
    });
    setSelectedCells(allCells);
    setAnchorCell({ rowIndex: 0, colIndex: 0 });
    setFocusCell({ rowIndex: 0, colIndex: 0 });
  }

  // --------------------------------------------------------------------------
  // Efecto de auto-copiado: tras 1s de cambiar la selección (y no estar editando).
  // --------------------------------------------------------------------------
  const autoCopyTimerRef = useRef(null);

  useEffect(() => {
    if (!selectedCells?.length) return;
    if (editingCell) return; // No copiamos automáticamente si se está editando

    // Limpiamos anterior timeout
    if (autoCopyTimerRef.current) {
      clearTimeout(autoCopyTimerRef.current);
    }

    // Programamos el auto-copy
    autoCopyTimerRef.current = setTimeout(async () => {
      if (!document.hasFocus()) {
        console.warn('[AutoCopy] Omitiendo copia, documento sin foco.');
        return;
      }
      await doCopyCells(selectedCells);
    }, AUTO_COPY_DELAY);

    return () => {
      if (autoCopyTimerRef.current) clearTimeout(autoCopyTimerRef.current);
    };
  }, [selectedCells, editingCell]);

  /**
   * getColumnDefWidth
   *  - Retorna el ancho definido en `originalColumnsDef` para la colId,
   *    o 80px si no se encuentra.
   */
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  // --------------------------------------------------------------------------
  // NUEVO: Estado y lógica para resaltar una fila al hacer clic en cualquier celda
  // (efecto meramente visual, sin alterar la selección real de celdas).
  // --------------------------------------------------------------------------
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

  /**
   * handleCellClick
   *  - Al hacer clic en una celda, se actualiza el estado "highlightedRowIndex"
   *    para resaltar visualmente toda la fila correspondiente.
   *  - No afecta la lógica de selección de celdas existente (selectedCells).
   */
  const handleCellClick = (rowIndex) => {
    setHighlightedRowIndex(rowIndex);
  };

  // --------------------------------------------------------------------------
  // Render Principal (JSX)
  // --------------------------------------------------------------------------
  return (
    <Box
      ref={containerRef}
      onContextMenu={handleContextMenu} // --> Usamos la función del hook
      sx={{
        position: 'relative',
        userSelect: 'none',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        backgroundColor: 'var(--color-bg-paper)',
        outline: 'none',
      }}
      tabIndex={0}
    >
      {/* Indicador de carga (spinner) */}
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
          <CircularProgress
            sx={{ color: 'var(--color-primary)', marginBottom: '8px' }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {LOADING_TEXT}
          </Typography>
        </Box>
      )}

      {/* Mensaje "Sin resultados" (si no está cargando y rows está vacío) */}
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
            {NO_RESULTS_TEXT}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Modifica los filtros o la búsqueda para ver más resultados.
          </Typography>
        </Box>
      )}

      <table className="custom-table">
        {/* colgroup: para asignar anchos a las columnas */}
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

        <thead>
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

                      {/* Botón de filtro en la cabecera (excepto en la col índice) */}
                      {!isIndexCol && (
                        <div className="column-header-actions">
                          <IconButton
                            size="small"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              handleOpenMenu(evt, colId);
                            }}
                            sx={{ color: 'var(--color-text)', padding: '2px' }}
                          >
                            <FilterListIcon
                              fontSize="inherit"
                              style={{ fontSize: '14px' }}
                            />
                          </IconButton>
                        </div>
                      )}
                    </div>

                    {/* Manilla (handle) para redimensionar la columna */}
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

        <tbody>
          {rows.map((row, rIndex) => {
            const rowIndex = row.id; // ID interno (string) asignado por React Table

            // Determinamos si la fila está resaltada "por clic".
            const rowIsHighlighted = highlightedRowIndex === rIndex;

            return (
              <tr
                key={rowIndex}
                style={{
                  height: ROW_HEIGHT,
                  // Si la fila está resaltada, usamos un color especial
                  backgroundColor: rowIsHighlighted
                    ? 'var(--color-table-row-highlight, #fff9e6)'
                    : 'transparent',
                }}
              >
                {row.getVisibleCells().map((cell, cIndex) => {
                  const colId = cell.column.id;
                  const isIndexCol = colId === '_selectIndex';

                  // Determina si la celda está en la selección/copiado
                  const isSelected = selectedCells.some(
                    (sc) => sc.id === rowIndex && sc.colField === colId
                  );
                  const isCopied = copiedCells.some(
                    (cc) => cc.id === rowIndex && cc.colField === colId
                  );

                  // ¿Está en modo edición en línea?
                  const inEditingMode = isEditingCell(rowIndex, colId);

                  // Valor crudo de la celda
                  const rawValue = cell.getValue();

                  // Si existe un "cell renderer" personalizado en la definición, úsalo
                  const customRender = cell.column.columnDef.cell
                    ? cell.column.columnDef.cell({
                        getValue: () => rawValue,
                        column: cell.column,
                        row: cell.row,
                        table,
                      })
                    : rawValue;

                  // Valor final a mostrar (evita null, objetos, etc.)
                  const displayValue = safeDisplayValue(customRender);

                  // JSX final de la celda (modo edición vs modo lectura)
                  let cellContent;
                  if (inEditingMode) {
                    cellContent = (
                      <input
                        type="text"
                        autoFocus
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
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
                      // Doble clic => iniciar edición de celda
                      onDoubleClick={() =>
                        handleDoubleClick(rowIndex, colId, displayValue)
                      }
                      // Clic => resaltar la fila visualmente
                      onClick={() => handleCellClick(rIndex)}
                      // MouseDown en la columna índice => selección de la fila
                      onMouseDown={(evt) => {
                        if (isIndexCol) {
                          handleRowIndexMouseDown(evt, rIndex, rowIndex);
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

      {/* Popover para configurar filtros en la columna */}
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

      {/* Menú Contextual para copiar / ocultar columna / ocultar fila */}
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
        {/* Opción "Copiar" */}
        <MenuItem onClick={handleCopyFromMenu}>Copiar</MenuItem>

        {/* Opción "Ocultar Columna" (solo si se hizo clic en cabecera y onHideColumns existe) */}
        {onHideColumns && clickedHeaderIndex != null && (
          <MenuItem onClick={handleHideColumn}>Ocultar Columna</MenuItem>
        )}

        {/* Opción "Ocultar Fila" (solo si se hizo clic en una fila y onHideRows existe) */}
        {onHideRows && clickedRowIndex != null && (
          <MenuItem onClick={handleHideRow}>Ocultar Fila</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
