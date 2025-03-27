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

// Componentes relacionados
import ColumnFilterConfiguration from '../ColumnConfiguration';

// Utilidades y constantes
import {
  SELECTED_CELL_CLASS,
  COPIED_CELL_CLASS,
} from '../tableViewVisualEffects';

const ROW_HEIGHT = 20;
const LOADING_TEXT = 'Cargando datos...';
const NO_RESULTS_TEXT = 'Sin resultados';
const AUTO_COPY_DELAY = 1000;

/**
 * safeDisplayValue
 *  - Convierte un valor a una representación segura en texto, evitando mostrar null,
 *    o [object Object].
 *  - Si es un elemento React, se retorna tal cual.
 *  - Si es un objeto, se hace JSON.stringify.
 *
 * @param {*} val - Valor a formatear.
 * @returns {string|JSX.Element} - Cadena de texto o elemento React.
 */
function safeDisplayValue(val) {
  if (val == null) return '';
  if (typeof val === 'object') {
    if (val.$$typeof) {
      // Es un elemento React
      return val;
    }
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Componente principal de la vista de la tabla.
 *
 * @param {Object} props - Propiedades recibidas.
 * @param {object} props.table - Instancia de la tabla (react-table) con filas y columnas.
 * @param {Array} props.selectedCells - Lista de celdas seleccionadas, con estructura {id, colField}.
 * @param {function} props.setSelectedCells - Setter para actualizar las celdas seleccionadas.
 * @param {boolean} props.loading - Indica si se está cargando información (muestra spinner).
 * @param {Object} props.anchorCell - Celda “ancla” de la selección.
 * @param {Object} props.focusCell - Celda en foco dentro de la selección.
 * @param {function} props.setAnchorCell - Setter para la celda ancla.
 * @param {function} props.setFocusCell - Setter para la celda con foco.
 * @param {Object} props.columnFilters - Filtros por columna (ej. { colId: { operator, value, ...}, ... }).
 * @param {function} props.updateColumnFilter - Función para actualizar el filtro de una columna específica.
 * @param {Array} props.columnsDef - Definición de columnas (usualmente de buildColumnsFromDefinition).
 * @param {Array} [props.originalColumnsDef=[]] - Definición original de columnas, utilizada en eventos.
 * @param {Object} props.columnWidths - Objeto con ancho de cada columna (colId -> width).
 * @param {function} props.setColumnWidth - Setter para asignar ancho a una columna dada.
 * @param {Object} props.containerRef - Referencia al contenedor principal de la tabla.
 * @param {function} [props.onHideColumns] - Callback para ocultar columnas.
 * @param {function} [props.onHideRows] - Callback para ocultar filas.
 * @param {Object} props.sorting - Estado de ordenamiento ({ columnId, direction }).
 * @param {function} props.toggleSort - Función para cambiar el estado de ordenamiento.
 *
 * @returns {JSX.Element} - Renderiza la tabla HTML con la lógica de selección,
 *   menús y edición en línea.
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
  // Filas procesadas por react-table (ya paginadas/filtradas)
  const rows = table.getRowModel().rows;
  // Data completa (si es necesaria para copiado, etc.)
  const data = table.options.data || [];

  /**
   * Hook para manejar el copiado de celdas con Ctrl + C.
   * Retorna { copiedCells, setCopiedCells } con el historial de celdas copiadas.
   */
  const { copiedCells, setCopiedCells } = useClipboardCopy(
    containerRef,
    selectedCells,
    data,
    columnsDef
  );

  /**
   * Hook para manejar la lógica de redimensionado de columnas.
   * Retorna handleMouseDownResize => fn(evt, colId)
   */
  const { handleMouseDownResize } = useColumnResize({
    columnWidths,
    setColumnWidth,
    originalColumnsDef,
  });

  /**
   * Hook para edición en línea de celdas.
   * Permite editar una celda tras doble clic, con handleDoubleClick, handleChange, etc.
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

  // ** Popover de filtros en columnas **
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

  // ** Menú contextual (clic derecho) **
  const [contextMenu, setContextMenu] = useState(null);
  const [clickedHeaderIndex, setClickedHeaderIndex] = useState(null);
  const [clickedRowIndex, setClickedRowIndex] = useState(null);

  /**
   * handleContextMenu
   *  - Identifica si el clic derecho se hizo sobre la cabecera o sobre alguna fila.
   *  - Guarda la posición para el menú contextual (x,y).
   */
  const handleContextMenu = (e) => {
    e.preventDefault();
    let el = e.target;
    let foundHeaderIndex = null;
    let foundRowIndex = null;

    // Se recorre el árbol hasta encontrar 'data-header-index' o 'data-row'
    while (el && el !== document.body) {
      if (el.hasAttribute('data-header-index')) {
        foundHeaderIndex = parseInt(el.getAttribute('data-header-index'), 10);
        break;
      }
      if (el.hasAttribute('data-row')) {
        foundRowIndex = parseInt(el.getAttribute('data-row'), 10);
      }
      el = el.parentElement;
    }

    setClickedHeaderIndex(foundHeaderIndex);
    setClickedRowIndex(foundRowIndex);

    setContextMenu(
      contextMenu === null
        ? { mouseX: e.clientX + 2, mouseY: e.clientY - 6 }
        : null
    );
  };
  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setClickedHeaderIndex(null);
    setClickedRowIndex(null);
  };

  /**
   * doCopyCells
   *  - Copia un conjunto de celdas (cellsToCopy) en formato TSV.
   *  - Marcamos visualmente las celdas copiadas.
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

  /**
   * handleCopyFromMenu
   *  - Llamado al hacer clic en "Copiar" del menú contextual,
   *    para copiar las celdas seleccionadas.
   */
  const handleCopyFromMenu = async () => {
    handleCloseContextMenu();
    if (!selectedCells.length) return;
    await doCopyCells(selectedCells);
  };

  /**
   * handleHideColumn
   *  - Llamado al hacer clic en "Ocultar columna" del menú contextual.
   *  - Invoca onHideColumns con la columna clickeada.
   */
  const handleHideColumn = () => {
    handleCloseContextMenu();
    if (!onHideColumns || clickedHeaderIndex == null) return;
    const col = table.getVisibleFlatColumns()[clickedHeaderIndex];
    if (!col) return;
    if (col.id !== '_selectIndex') {
      onHideColumns([col.id]);
    }
  };

  /**
   * handleHideRow
   *  - Llamado al hacer clic en "Ocultar fila" del menú contextual.
   *  - Invoca onHideRows con la fila clickeada.
   */
  const handleHideRow = () => {
    handleCloseContextMenu();
    if (!onHideRows || clickedRowIndex == null) return;
    const rowObj = rows[clickedRowIndex]?.original;
    if (!rowObj) return;
    onHideRows([clickedRowIndex]);
  };

  // ** Lógica de arrastre para selección de columnas/filas **
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
   *  - Inicia la selección por arrastre en la cabecera.
   */
  const handleHeaderMouseDown = (e, colIndex, colId) => {
    if (e.target.classList.contains('resize-handle')) return; // El resize handle no dispara selección
    if (colId === '_selectIndex') return; // No iniciamos arrastre con la columna índice
    dragStateRef.current.isDraggingCols = true;
    dragStateRef.current.startColIndex = colIndex;
    setIsDraggingColumns(true);
    setStartColIndex(colIndex);
  };

  /**
   * handleRowIndexMouseDown
   *  - Inicia la selección por arrastre en la columna índice.
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

  /**
   * useEffect para escuchar los eventos globales (mousemove, mouseup),
   * necesarios para la selección tipo “drag” sobre filas/columnas.
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { isDraggingCols, isDraggingRows, startColIndex, startRowIndex } =
        dragStateRef.current;
      if (!containerRef.current) return;

      if (isDraggingCols) {
        // Se detecta la columna bajo el mouse y se selecciona el rango [startColIndex, actual]
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
      } else if (isDraggingRows) {
        // Se detecta la fila bajo el mouse y se selecciona el rango [startRowIndex, actual]
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

  /**
   * handleHeaderClick
   *  - Si el clic se hace sobre la columna índice, selecciona toda la tabla.
   *  - Sino, selecciona toda la columna clickeada.
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
   * selectColumnRange
   *  - Selecciona un rango de columnas [start, end] para todas las filas visibles.
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
   *  - Selecciona un rango de filas [start, end] para todas las columnas visibles.
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
   *  - Selecciona toda la fila (todas las columnas) para un índice de fila dado.
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
   *  - Selecciona toda la columna colId en todas las filas.
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

  /**
   * Efecto para auto-copiado tras 1s de haber cambiado la selección (y no estar editando).
   */
  const autoCopyTimerRef = useRef(null);
  useEffect(() => {
    if (!selectedCells?.length) return;
    if (editingCell) return; // No copiar si se está editando

    if (autoCopyTimerRef.current) clearTimeout(autoCopyTimerRef.current);

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
   *  - Determina el ancho default definido en originalColumnsDef o 80px por defecto.
   */
  function getColumnDefWidth(colId) {
    const col = originalColumnsDef.find((c) => c.accessorKey === colId);
    return col?.width ?? 80;
  }

  // ** Render principal de la tabla **
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

                      {/* Botón de filtro (excepto en la columna índice) */}
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

                    {/* Handle de resize */}
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
            const rowIndex = row.id; // ID interno = índice
            return (
              <tr key={rowIndex} style={{ height: ROW_HEIGHT }}>
                {row.getVisibleCells().map((cell, cIndex) => {
                  const colId = cell.column.id;
                  const isIndexCol = colId === '_selectIndex';

                  // Determinar si está seleccionada o copiada
                  const isSelected = selectedCells.some(
                    (sc) => sc.id === rowIndex && sc.colField === colId
                  );
                  const isCopied = copiedCells.some(
                    (cc) => cc.id === rowIndex && cc.colField === colId
                  );

                  const inEditingMode = isEditingCell(rowIndex, colId);
                  const rawValue = cell.getValue();

                  // Render personalizado de la celda, si existe
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

      {/* Popover de configuración de filtros de la columna */}
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

      {/* Menú contextual (Copiar/Ocultar) */}
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
