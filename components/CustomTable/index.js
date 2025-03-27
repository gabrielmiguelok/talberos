/**
 * Archivo: /components/CustomTable/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * Este archivo define el componente principal `CustomTable`.
 * Provee:
 *   1. Manejo de tema (oscuro/claro).
 *   2. Configuración y renderizado de columnas a partir de un `columnsDef`.
 *   3. Filtros, búsqueda global, y ordenamiento.
 *   4. Exportación a Excel.
 *   5. Paginación.
 *   6. Soporte para selección de celdas y copiado.
 *
 * DEPENDENCIAS Y MÓDULOS EXTERNOS:
 *   - react, xlsx, @tanstack/react-table, etc.
 *   - Hooks personalizados: useDebouncedValue, useCellSelection.
 *   - Componentes auxiliares: FiltersToolbar, TableSection, Pagination.
 *
 * EJEMPLO DE USO:
 * ~~~javascript
 * <CustomTable
 *   data={dataArray}
 *   columnsDef={columnsDefinition}
 *   pageSize={50}
 *   loading={isLoading}
 *   filtersToolbarProps={{ ... }}
 *   onRefresh={handleDataRefresh}
 *   showFiltersToolbar
 *   onHideColumns={(colIds) => console.log('Ocultar columnas:', colIds)}
 *   onHideRows={(rowsIds) => console.log('Ocultar filas:', rowsIds)}
 * />
 * ~~~
 */

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useDebouncedValue } from '../hooks/useDebouncedValue';
import useCellSelection from '../hooks/useCellSelection';
import {
  FilterFlow,
  applySorting,
  getExportColumnsDef,
  getExportValue,
} from './filterFlow';

import FiltersToolbar from '../toolbar/FiltersToolbar';
import TableSection from '../TableView';
import Pagination from './Pagination';

/**
 * Componente principal: CustomTable
 *
 * @param {Array} data - Arreglo de objetos que representan las filas de la tabla.
 * @param {Array} columnsDef - Definición de columnas,
 *        típicamente generada con buildColumnsFromDefinition() u otro método.
 * @param {number} [pageSize=50] - Cantidad de filas por página.
 * @param {boolean} [loading=false] - Indica si se está realizando una operación (carga, refresco, etc.).
 * @param {Object} [filtersToolbarProps] - Propiedades que se pasan al componente `FiltersToolbar`.
 * @param {Function} [onRefresh] - Función de callback que se ejecuta al presionar el botón de refrescar en la toolbar.
 * @param {boolean} [showFiltersToolbar=true] - Controla si se muestra o no la barra de filtros (FiltersToolbar).
 * @param {Function} [onHideColumns] - Callback para ocultar una o varias columnas. Recibe un array de IDs de columnas.
 * @param {Function} [onHideRows] - Callback para ocultar una o varias filas. Recibe un array de índices (IDs de filas).
 *
 * @returns {JSX.Element} - Devuelve el componente de tabla con todas sus características.
 *
 * @description
 * Este componente encapsula toda la lógica de filtrado, paginación, exportación a Excel
 * y selección de celdas (copiado). Se apoya en diversas librerías:
 *   - XLSX para la exportación.
 *   - @tanstack/react-table para la gestión de datos tabulares y paginación.
 *   - Hooks y componentes internos para la interfaz y la lógica de selección.
 */
export default function CustomTable({
  data,
  columnsDef,
  pageSize = 50,
  loading,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
}) {
  // Manejo de tema oscuro/claro
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * Efecto que añade o quita la clase 'dark-mode' en la etiqueta <html>.
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  /**
   * Maneja el toggle de tema oscuro/claro.
   */
  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  /**
   * Memo para columnas finales a partir de `columnsDef`.
   * Si columnsDef es nulo o vacío, retorna un array vacío.
   */
  const finalColumns = useMemo(() => {
    return columnsDef && columnsDef.length > 0 ? columnsDef : [];
  }, [columnsDef]);

  const columnHelper = createColumnHelper();

  /**
   * Crea columnas, añadiendo una columna inicial para mostrar el índice de la fila.
   */
  const indexedColumns = useMemo(() => {
    const selectIndexColumn = columnHelper.display({
      id: '_selectIndex',
      header: '',
      cell: (info) => info.row.index + 1, // Muestra índice basado en posición
      meta: {
        isSelectIndex: true,
        minWidth: 32,
        width: 32,
      },
    });

    // Construye columnas para cada definición de usuario.
    const userColumns = finalColumns.map((col) =>
      columnHelper.accessor(col.accessorKey, {
        header: col.header,
        cell: col.cell,
        meta: {
          minWidth: col.minWidth || undefined,
          flex: col.flex || undefined,
          filterMode: col.filterMode || 'contains',
          isNumeric: col.isNumeric || false,
        },
      })
    );

    return [selectIndexColumn, ...userColumns];
  }, [finalColumns, columnHelper]);

  /**
   * Referencia al contenedor principal de la tabla (DOM), usada para selección de celdas.
   */
  const containerRef = useRef(null);

  /**
   * Estado de filtros por columna (columnFilters).
   * - Estructura sugerida: { nombreCol: { operator, value, min, max, exact, ... }, ... }
   */
  const [columnFilters, setColumnFilters] = useState({});

  /**
   * Manejo de filtro global (buscador general).
   * - `tempGlobalFilter`: estado inmediato del input.
   * - `debouncedGlobalFilter`: valor con retraso de 500ms, para no filtrar en cada pulsación.
   */
  const [tempGlobalFilter, setTempGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(tempGlobalFilter, 500);

  /**
   * Estado para controlar el ordenamiento por columna.
   * Estructura: { columnId: string, direction: 'asc' | 'desc' | '' }
   */
  const [sorting, setSorting] = useState({ columnId: '', direction: '' });

  /**
   * Cambia el estado de ordenamiento según la columna seleccionada.
   */
  const toggleSort = (colId) => {
    setSorting((prev) => {
      if (prev.columnId !== colId) return { columnId: colId, direction: 'desc' };
      if (prev.direction === 'desc') return { columnId: colId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId: '', direction: '' };
      return { columnId: colId, direction: 'desc' };
    });
  };

  /**
   * Efecto para forzar un operador 'range' si el campo es numérico y se detectan valores min/max.
   */
  useEffect(() => {
    Object.keys(columnFilters).forEach((colId) => {
      const colDef = finalColumns.find((c) => c.accessorKey === colId);
      if (colDef?.isNumeric) {
        const cf = columnFilters[colId];
        if (cf) {
          const { operator, min, max } = cf;
          if ((min != null || max != null) && !operator) {
            setColumnFilters((prev) => ({
              ...prev,
              [colId]: { ...prev[colId], operator: 'range' },
            }));
          }
        }
      }
    });
  }, [columnFilters, finalColumns]);

  /**
   * Aplica el filtrado y ordenamiento a los datos.
   */
  const filteredData = useMemo(() => {
    const flow = new FilterFlow({
      data,
      columnsDef: finalColumns,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
    });
    const filtered1 = flow._applyColumnFilters([...data]);
    const filtered2 = flow._applyGlobalFilter(filtered1);
    const filtered3 = flow._applyColumnSorting(filtered2);

    if (sorting.columnId && sorting.direction) {
      return applySorting(filtered3, sorting, finalColumns);
    }
    return filtered3;
  }, [data, finalColumns, columnFilters, debouncedGlobalFilter, sorting]);

  /**
   * Se crea la instancia de tabla usando React Table (TanStack).
   */
  const table = useReactTable({
    data: filteredData,
    columns: indexedColumns,
    getRowId: (_row, rowIndex) => String(rowIndex), // Retornamos un STRING de "0", "1", etc.
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(filteredData.length / pageSize),
    manualPagination: false,
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });

  /**
   * Hook personalizado para manejo de selección de celdas, copiado, etc.
   */
  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(
    containerRef,
    getCellsInfo,
    filteredData,
    finalColumns,
    table
  );

  /**
   * Estado para almacenar las celdas que han sido copiadas.
   */
  const [copiedCells, setCopiedCells] = useState([]);

  /**
   * Obtiene la información de cada celda (posición, tamaño, rowIndex, colField).
   */
  function getCellsInfo() {
    if (!containerRef.current) return [];
    const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
    const cells = [];
    cellEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const rowIdString = el.getAttribute('data-row');
      const cIndex = parseInt(el.getAttribute('data-col'), 10);

      // rowIdString vendrá de "row.id", que es un string (e.g. "0", "1", etc.)
      if (rowIdString == null || isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const rowId = rowIdString; // Mantener string
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

  /**
   * Efecto que escucha teclas de flecha para la navegación de celdas.
   */
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

  /**
   * Exportar a Excel.
   */
  const handleDownloadExcel = () => {
    try {
      const exportCols = getExportColumnsDef(finalColumns);
      const wsData = [
        exportCols.map((c) => c.header),
        ...filteredData.map((row) =>
          exportCols.map((col) => String(getExportValue(row, col)))
        ),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      const wbArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tabla_exportada.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando Excel:', err);
    }
  };

  /**
   * Estado y setter para el ancho de columnas.
   */
  const [columnWidths, setColumnWidths] = useState({});

  /**
   * Actualiza el ancho de una columna.
   */
  const handleSetColumnWidth = (colId, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [colId]: Math.max(50, width),
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      {showFiltersToolbar && (
        <FiltersToolbar
          {...(filtersToolbarProps || {})}
          globalFilterValue={tempGlobalFilter}
          onGlobalFilterChange={(val) => setTempGlobalFilter(val)}
          onDownloadExcel={handleDownloadExcel}
          onRefresh={onRefresh}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
        />
      )}

      <div
        style={{
          filter: loading ? 'blur(2px)' : 'none',
          transition: 'filter 0.2s ease-in-out',
        }}
      >
        <TableSection
          table={table}
          columnFilters={columnFilters}
          updateColumnFilter={(colId, filterValue) =>
            setColumnFilters((prev) => ({
              ...prev,
              [colId]: { ...prev[colId], ...filterValue },
            }))
          }
          columnsDef={finalColumns}
          originalColumnsDef={finalColumns}
          loading={loading}
          containerRef={containerRef}
          selectedCells={selectedCells}
          setSelectedCells={setSelectedCells}
          anchorCell={anchorCell}
          focusCell={focusCell}
          setFocusCell={setFocusCell}
          setAnchorCell={setAnchorCell}
          copiedCells={copiedCells}
          setCopiedCells={setCopiedCells}
          columnWidths={columnWidths}
          setColumnWidth={handleSetColumnWidth}
          sorting={sorting}
          toggleSort={toggleSort}
          onHideColumns={onHideColumns}
          onHideRows={onHideRows}
        />
        <Pagination table={table} />
      </div>

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: 0,
            right: 0,
            height: 'calc(100% - 50px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(3px)',
            transition: 'all 0.2s ease-in-out',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 0 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#333',
              animation: 'pulse 1.2s infinite',
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>🔄</span>
            <span>Actualizando...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
