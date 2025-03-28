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
 * DEPENDENCIAS:
 *   - react, xlsx, @tanstack/react-table, etc.
 *   - Hooks personalizados: useDebouncedValue, useCellSelection.
 *   - Componentes auxiliares: FiltersToolbar, TableSection, Pagination.
 *
 * EJEMPLO DE USO:
 * ~~~javascript
 * <CustomTable
 *   data={dataArray}
 *   columnsDef={columnsDefinition}
 *   // themeMode por defecto "light"
 *   // O "dark" si quieres iniciar en oscuro
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
 * @param {Array}  data              - Filas de la tabla.
 * @param {Array}  columnsDef        - Definición de columnas.
 * @param {string} [themeMode='light'] - "light" (por defecto) o "dark".
 * @param {number} [pageSize=50]     - Cant. de filas por página.
 * @param {boolean} [loading=false]  - Indica si está cargando.
 * @param {Object} [filtersToolbarProps] - Props p/ `FiltersToolbar`.
 * @param {Function} [onRefresh]     - Callback del botón "Refrescar".
 * @param {boolean} [showFiltersToolbar=true] - Muestra la barra de filtros.
 * @param {Function} [onHideColumns] - Callback para ocultar columnas.
 * @param {Function} [onHideRows]    - Callback para ocultar filas.
 *
 * @returns {JSX.Element}
 */
export default function CustomTable({
  data,
  columnsDef,
  themeMode = 'light',  // Valor inicial
  pageSize = 50,
  loading,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
}) {
  // ---------------------------
  // 1) Manejo interno del tema
  // ---------------------------
  const [internalThemeMode, setInternalThemeMode] = useState(themeMode);

  // Toggle local
  const handleThemeToggleLocal = () => {
    setInternalThemeMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  // Determina si está en modo oscuro
  const isDarkMode = internalThemeMode === 'dark';

  // ---------------------------
  // 2) Definición de columnas
  // ---------------------------
  const finalColumns = useMemo(() => {
    return columnsDef && columnsDef.length > 0 ? columnsDef : [];
  }, [columnsDef]);

  const columnHelper = createColumnHelper();

  const indexedColumns = useMemo(() => {
    const selectIndexColumn = columnHelper.display({
      id: '_selectIndex',
      header: '',
      cell: (info) => info.row.index + 1,
      meta: {
        isSelectIndex: true,
        minWidth: 32,
        width: 32,
      },
    });

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

  // ---------------------------
  // 3) Filtros, ordenamiento
  // ---------------------------
  const containerRef = useRef(null);

  // Filtros por columna
  const [columnFilters, setColumnFilters] = useState({});

  // Filtro global (con debounce)
  const [tempGlobalFilter, setTempGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(tempGlobalFilter, 500);

  // Ordenamiento
  const [sorting, setSorting] = useState({ columnId: '', direction: '' });

  const toggleSort = (colId) => {
    setSorting((prev) => {
      if (prev.columnId !== colId) return { columnId: colId, direction: 'desc' };
      if (prev.direction === 'desc') return { columnId: colId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId: '', direction: '' };
      return { columnId: colId, direction: 'desc' };
    });
  };

  // Forzar operador 'range' si la columna es numérica y hay min/max
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

  // ---------------------------
  // 4) Filtrado y ordenamiento
  // ---------------------------
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

  // ---------------------------
  // 5) Instancia de la tabla
  // ---------------------------
  const table = useReactTable({
    data: filteredData,
    columns: indexedColumns,
    getRowId: (_row, rowIndex) => String(rowIndex),
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

  // ---------------------------
  // 6) Selección de celdas, copiado
  // ---------------------------
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

  const [copiedCells, setCopiedCells] = useState([]);

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

  // Listener para flechas en containerRef
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

  // ---------------------------
  // 7) Exportar a Excel
  // ---------------------------
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

  // ---------------------------
  // 8) Ancho de columnas
  // ---------------------------
  const [columnWidths, setColumnWidths] = useState({});

  const handleSetColumnWidth = (colId, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [colId]: Math.max(50, width),
    }));
  };

  // -------------------------------------------------------------------------
  // Render Principal
  // -------------------------------------------------------------------------
  return (
    <div
      className={`customTableContainer ${
        isDarkMode ? 'tabla-dark' : 'tabla-light'
      }`}
      style={{ position: 'relative' }}
    >
      {showFiltersToolbar && (
        <FiltersToolbar
          {...(filtersToolbarProps || {})}
          globalFilterValue={tempGlobalFilter}
          onGlobalFilterChange={(val) => setTempGlobalFilter(val)}
          onDownloadExcel={handleDownloadExcel}
          onRefresh={onRefresh}
          isDarkMode={isDarkMode}
          // Sobrescribimos el onThemeToggle para manejarlo local:
          onThemeToggle={handleThemeToggleLocal}
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
