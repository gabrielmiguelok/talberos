/************************************************************************************
 * LOCATION: /components/registros/TableView/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Este sub-componente se encarga de renderizar la tabla HTML principal,
 *   incluyendo:
 *    - Selección de celdas (con drag, shift-click, etc.).
 *    - Selección arrastrando en la cabecera (horizontal) o en la primera
 *      columna (vertical), con soporte para mouse y touch.
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
 *   Se agrega la lógica para anular el scroll del documento/contenedor
 *   mientras el usuario está arrastrando (mouse/touch).
 *
 * @version 3.4
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
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * TableView
 *  - Componente principal para renderizar la tabla HTML con:
 *      • Selección de celdas (drag, shift-click, etc.) incluso desde cabecera/columna índice.
 *      • Menú contextual (copiar, ocultar columnas/filas).
 *      • Indicadores de carga y sin resultados.
 *      • Edición en línea de celdas.
 *      • Filtrado por columna (con un Popover que abre un configurador).
 *      • Lógica de redimensionado de columnas.
 *      • Manejo del copiado (auto-copy y Ctrl+C manual).
 *      • Anulación del scroll mientras se arrastra con mouse o touch.
 *
 * @param {object} props.table              - Instancia de la tabla (react-table).
 * @param {Array} props.selectedCells       - Lista de celdas seleccionadas ({id, colField}).
 * @param {Function} props.setSelectedCells - Setter para la selección de celdas.
 * @param {boolean} props.loading           - Indica si los datos están cargando.
 * @param {object} props.anchorCell         - Celda “ancla” de la selección.
 * @param {object} props.focusCell          - Celda en foco dentro de la selección.
 * @param {Function} props.setAnchorCell    - Setter para la celda ancla.
 * @param {Function} props.setFocusCell     - Setter para la celda con foco.
 * @param {object} props.columnFilters      - Filtros por columna (e.g. {colId: {operator, value, ...}}).
 * @param {Function} props.updateColumnFilter - Actualizador de filtro por columna.
 * @param {Array} props.columnsDef          - Definición de columnas.
 * @param {Array} [props.originalColumnsDef=[]] - Definición original de columnas (con widths, etc.).
 * @param {object} props.columnWidths       - Ancho de cada columna (colId -> width).
 * @param {Function} props.setColumnWidth   - Setter para asignar ancho a una columna.
 * @param {object} props.containerRef       - Referencia al contenedor principal de la tabla.
 * @param {Function} [props.onHideColumns]  - Callback para ocultar columnas (array de col IDs).
 * @param {Function} [props.onHideRows]     - Callback para ocultar filas (array de row IDs).
 * @param {object} props.sorting            - Estado de ordenamiento ({ columnId, direction }).
 * @param {Function} props.toggleSort       - Función para cambiar el ordenamiento.
 *
 * @returns {JSX.Element} Renderizado de la tabla con selección, filtrado y más.
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
  // Filas procesadas (paginación, filtrado, etc.) por React Table
  const rows = table.getRowModel().rows;
  // Data completa (si se requiere para copiar contenido crudo).
  const data = table.options.data || [];

  // Hook para copiar celdas (Ctrl + C) y marcar celdas copiadas visualmente
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    data,
    columnsDef
  );

  // Hook para redimensionar columnas
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  // Hook de edición en línea de celdas
  const {
    editingCell,
    editingValue,
    isEditingCell,
    handleDoubleClick,
    handleChange,
    handleKeyDown,
    handleBlur,
  } = useInlineCellEdit();

  // Popover para configurar filtros de columna
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

  /**
   * Función interna para copiar celdas en formato TSV.
   * Marca las celdas copiadas si todo es correcto.
   */
  async function doCopyCells(cellsToCopy) {
    if (!cellsToCopy?.length) return;
    if (!document.hasFocus()) {
      console.warn('No se copió: el documento no está enfocado.');
      return;
    }
    try {
      // Mapear rowIndex => rowData original
      const dataMap = new Map();
      rows.forEach((r) => {
        dataMap.set(r.id, r.original);
      });

      // Para cada celda, recogemos el valor en un map rowId -> [valores...]
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

  // Hook con TODA la lógica del menú contextual (copiar, ocultar cols/filas)
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

  // --------------------------------------------------------------------------
  // Lógica de arrastre para selección de columnas/filas (mouse y touch),
  // con anulación del scroll.
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
   * handleHeaderMouseDown:
   *  - Cuando se hace mousedown en el header, inicia la selección por arrastre horizontal (mouse).
   */
  const handleHeaderMouseDown = (e, colIndex, colId) => {
    // Ignorar si clic en el resize-handle
    if (e.target.classList.contains('resize-handle')) return;
    // Ignorar si es la columna índice (por convención, colId === '_selectIndex')
    if (colId === '_selectIndex') return;

    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  };

  /**
   * handleHeaderTouchStart:
   *  - Equivalente en touch para arrastre horizontal en cabecera.
   */
  const handleHeaderTouchStart = (e, colIndex, colId) => {
    if (colId === '_selectIndex') return;
    // Chequear si el dedo cae en la "resize-handle"
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
   *  - Cuando se hace mousedown en la primera col (índice), inicia selección vertical (mouse).
   */
  const handleRowIndexMouseDown = (e, rowIndex, rowId) => {
    e.stopPropagation();
    e.preventDefault();
    // Seleccionar la fila en ese momento (single click)
    selectEntireRow(rowIndex, rowId);

    // Preparar arrastre vertical
    dragStateRef.current.isDraggingRows = true;
    dragStateRef.current.startRowIndex = rowIndex;
    setIsDraggingRows(true);
    setStartRowIndex(rowIndex);
  };

  /**
   * handleRowIndexTouchStart:
   *  - Equivalente en touch para arrastre vertical desde la primera col.
   */
  const handleRowIndexTouchStart = (e, rowIndex, rowId) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.touches.length === 1) {
      // Seleccionar la fila en ese instante (tap simple)
      selectEntireRow(rowIndex, rowId);

      // Y habilitar la lógica de arrastre vertical
      dragStateRef.current.isDraggingRows = true;
      dragStateRef.current.startRowIndex = rowIndex;
      setIsDraggingRows(true);
      setStartRowIndex(rowIndex);
    }
  };

  /**
   * useEffect que maneja mousemove/mouseup Y touchmove/touchend para arrastrar.
   * Se usa { passive: false } para poder hacer e.preventDefault() y así anular el scroll.
   */
  useEffect(() => {
    // Función interna para seleccionar en base a coordenadas
    const handlePointerMove = (clientX, clientY, e) => {
      const { isDraggingCols, isDraggingRows, startColIndex, startRowIndex } =
        dragStateRef.current;

      if (!containerRef.current) return;

      if (isDraggingCols) {
        // Evitamos el scroll
        e.preventDefault();

        // Selección horizontal de columnas
        const colEls = containerRef.current.querySelectorAll(
          'thead tr:first-child th'
        );
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
          selectColumnRange(startColIndex, currentIndex);
        }
      } else if (isDraggingRows) {
        // Evitamos el scroll
        e.preventDefault();

        // Selección vertical de filas
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
          selectRowRange(startRowIndex, currentRow);
        }
      }
    };

    const handleMouseMove = (e) => {
      const { isDraggingCols, isDraggingRows } = dragStateRef.current;
      if (!isDraggingCols && !isDraggingRows) return;
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

    // Touch equivalents
    const handleTouchMove = (e) => {
      const { isDraggingCols, isDraggingRows } = dragStateRef.current;
      if (!isDraggingCols && !isDraggingRows) return;
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // e.preventDefault() se hace dentro de handlePointerMove
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
  }, [containerRef]);

  /**
   * handleHeaderClick:
   *  - Al hacer click en header, si colId es _selectIndex => seleccionar toda la tabla
   *    o si no => seleccionar toda la columna.
   */
  const handleHeaderClick = (e, colIndex, colId) => {
    if (e.target.classList.contains('resize-handle')) return;
    if (colId === '_selectIndex') {
      selectAllCells();
      return;
    }
    selectEntireColumn(colIndex, colId);
  };

  /**
   * selectColumnRange:
   *  - Selecciona un rango de columnas [start, end] en TODAS las filas.
   */
  function selectColumnRange(start, end) {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    const visibleCols = table.getVisibleFlatColumns();
    const newSelected = [];
    rows.forEach((row) => {
      const rowIndex = row.id;
      for (let c = min; c <= max; c++) {
        if (visibleCols[c].id === '_selectIndex') continue; // omitir col índice
        newSelected.push({ id: rowIndex, colField: visibleCols[c].id });
      }
    });
    setSelectedCells(newSelected);
    setAnchorCell({ rowIndex: 0, colIndex: min });
    setFocusCell({ rowIndex: 0, colIndex: min });
  }

  /**
   * selectRowRange:
   *  - Selecciona un rango de filas [start, end] en TODAS las columnas.
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
   * selectEntireRow:
   *  - Selecciona todas las columnas de la fila rIndex (excepto col índice).
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
   * selectEntireColumn:
   *  - Selecciona todas las filas de la columna colId (excepto las filas en col índice).
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
   * selectAllCells:
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
    // Anclar foco en la primera col real (que no sea índice)
    setAnchorCell({ rowIndex: 0, colIndex: 1 });
    setFocusCell({ rowIndex: 0, colIndex: 1 });
  }

  // --------------------------------------------------------------------------
  // Efecto de auto-copiado (tras 1s) luego de cambiar la selección
  // --------------------------------------------------------------------------
  const autoCopyTimerRef = useRef(null);

  useEffect(() => {
    if (!selectedCells?.length) return;
    if (editingCell) return; // No copiar mientras se edita
    if (autoCopyTimerRef.current) {
      clearTimeout(autoCopyTimerRef.current);
    }

    autoCopyTimerRef.current = setTimeout(async () => {
      if (!document.hasFocus()) {
        console.warn('[AutoCopy] Documento sin foco, no copiamos.');
        return;
      }
      await doCopyCells(selectedCells);
    }, AUTO_COPY_DELAY);

    return () => {
      if (autoCopyTimerRef.current) clearTimeout(autoCopyTimerRef.current);
    };
  }, [selectedCells, editingCell]);

  /**
   * getColumnDefWidth: retorna width definido en originalColumnsDef, o 80
   */
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  // --------------------------------------------------------------------------
  // Resaltar (row highlight) al hacer clic en una celda (solo efecto visual)
  // --------------------------------------------------------------------------
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

  const handleCellClick = (rowIndex) => {
    setHighlightedRowIndex(rowIndex);
  };

  // --------------------------------------------------------------------------
  // Render principal
  // --------------------------------------------------------------------------
  return (
    <Box
      ref={containerRef}
      onContextMenu={handleContextMenu}
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
      {/* Indicador de carga */}
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

      {/* Mensaje sin resultados */}
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
        {/* Ajustes de ancho de columnas con colgroup */}
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
                    onTouchStart={(e) =>
                      handleHeaderTouchStart(e, hIndex, colId)
                    }
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

                      {/* Ícono filtro en cabecera (excepto col índice) */}
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

                    {/* Manilla para resize */}
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
            const rowIndex = row.id; // ID interno react-table
            const rowIsHighlighted = highlightedRowIndex === rIndex;

            return (
              <tr
                key={rowIndex}
                style={{
                  height: ROW_HEIGHT,
                  backgroundColor: rowIsHighlighted
                    ? 'var(--color-table-row-highlight, #fff9e6)'
                    : 'transparent',
                }}
              >
                {row.getVisibleCells().map((cell, cIndex) => {
                  const colId = cell.column.id;
                  const isIndexCol = colId === '_selectIndex';

                  // Verificar si la celda está en la selección/copiado
                  const isSelected = selectedCells.some(
                    (sc) => sc.id === rowIndex && sc.colField === colId
                  );
                  const isCopied = copiedCells.some(
                    (cc) => cc.id === rowIndex && cc.colField === colId
                  );

                  const inEditingMode = isEditingCell(rowIndex, colId);
                  const rawValue = cell.getValue();

                  // Si hay un cell renderer personalizado
                  const customRender = cell.column.columnDef.cell
                    ? cell.column.columnDef.cell({
                        getValue: () => rawValue,
                        column: cell.column,
                        row: cell.row,
                        table,
                      })
                    : rawValue;

                  const displayValue = safeDisplayValue(customRender);

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
                      onDoubleClick={() =>
                        handleDoubleClick(rowIndex, colId, displayValue)
                      }
                      onClick={() => handleCellClick(rIndex)}
                      // MOUSE para la fila índice
                      onMouseDown={(evt) => {
                        if (isIndexCol) {
                          handleRowIndexMouseDown(evt, rIndex, rowIndex);
                        }
                      }}
                      // TOUCH para la fila índice
                      onTouchStart={(evt) => {
                        if (isIndexCol && evt.touches.length === 1) {
                          handleRowIndexTouchStart(evt, rIndex, rowIndex);
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

      {/* Popover: Configurar filtros de columna */}
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

      {/* Menú contextual (copiar, ocultar, etc.) */}
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
          <MenuItem onClick={handleHideColumn}>Ocultar Columna</MenuItem>
        )}
        {onHideRows && clickedRowIndex != null && (
          <MenuItem onClick={handleHideRow}>Ocultar Fila</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
