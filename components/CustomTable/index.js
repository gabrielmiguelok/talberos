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
 *   - Hooks personalizados: useDebouncedValue, useCellSelection, useCustomTableLogic, useThemeMode.
 *   - Componentes auxiliares: FiltersToolbar, TableSection, Pagination.
 *
 * EJEMPLO DE USO:
 * ~~~javascript
 * <CustomTable
 *   data={dataArray}
 *   columnsDef={columnsDefinition}
 *   themeMode="light" // o "dark"
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

import React, { useRef, useEffect, useState } from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import useCellSelection from '../hooks/useCellSelection';

import FiltersToolbar from '../toolbar/FiltersToolbar';
import TableSection from '../TableView';
import Pagination from './Pagination';

/**
 * Componente principal: CustomTable
 *
 * @param {Array}    data                  - Filas de la tabla.
 * @param {Array}    columnsDef            - Definición de columnas (sin la de índice).
 * @param {string}   [themeMode='light']   - "light" (por defecto) o "dark".
 * @param {number}   [pageSize=50]         - Cant. de filas por página.
 * @param {boolean}  [loading=false]       - Indica si está cargando.
 * @param {Object}   [filtersToolbarProps] - Props p/ `FiltersToolbar`.
 * @param {Function} [onRefresh]           - Callback del botón "Refrescar".
 * @param {boolean}  [showFiltersToolbar=true] - Muestra la barra de filtros.
 * @param {Function} [onHideColumns]       - Callback para ocultar columnas.
 * @param {Function} [onHideRows]          - Callback para ocultar filas.
 *
 * @returns {JSX.Element}
 */
export default function CustomTable({
  data,
  columnsDef,
  themeMode = 'light',
  pageSize = 50,
  loading = false,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
}) {
  //
  // 1) Hook de tema (uso deThemeMode)
  //
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  //
  // 2) Hook de orquestación principal (useCustomTableLogic)
  //
  const {
    table,
    columnFilters,
    setColumnFilters,
    tempGlobalFilter,
    setTempGlobalFilter,
    sorting,
    toggleSort,
    handleDownloadExcel,
    columnWidths,
    handleSetColumnWidth,
    finalColumns,
    filteredData,
  } = useCustomTableLogic({
    data,
    columnsDef,
    pageSize,
  });

  //
  // 3) Hook para selección de celdas y copiado
  //
  const containerRef = useRef(null);

  const {
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  } = useCellSelection(containerRef, getCellsInfo, filteredData, finalColumns, table);

  const [copiedCells, setCopiedCells] = useState([]);

  // Función requerida por useCellSelection para mapear DOM -> coordenadas de celdas
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

  // Listener de teclas (flechas) en el contenedor principal
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

  //
  // 4) Render principal: spinner, overlay, theme, etc.
  //
  return (
    <div
      className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
      style={{ position: 'relative' }}
    >
      {/* Barra de filtros */}
      {showFiltersToolbar && (
        <FiltersToolbar
          {...(filtersToolbarProps || {})}
          globalFilterValue={tempGlobalFilter}
          onGlobalFilterChange={setTempGlobalFilter}
          onDownloadExcel={handleDownloadExcel}
          onRefresh={onRefresh}
          isDarkMode={isDarkMode}
          // Usamos la función del hook
          onThemeToggle={toggleThemeMode}
        />
      )}

      {/* Contenedor principal (con blur si loading) */}
      <div
        style={{
          filter: loading ? 'blur(2px)' : 'none',
          transition: 'filter 0.2s ease-in-out',
        }}
      >
        <TableSection
          // Tabla (react-table)
          table={table}
          // Filtros
          columnFilters={columnFilters}
          updateColumnFilter={(colId, filterValue) =>
            setColumnFilters((prev) => ({
              ...prev,
              [colId]: { ...prev[colId], ...filterValue },
            }))
          }
          // Columnas
          columnsDef={finalColumns}
          originalColumnsDef={finalColumns}
          // Loading (por si quieres deshabilitar algo en la UI)
          loading={loading}
          // Selección de celdas
          containerRef={containerRef}
          selectedCells={selectedCells}
          setSelectedCells={setSelectedCells}
          anchorCell={anchorCell}
          focusCell={focusCell}
          setFocusCell={setFocusCell}
          setAnchorCell={setAnchorCell}
          copiedCells={copiedCells}
          setCopiedCells={setCopiedCells}
          // Resize de columnas
          columnWidths={columnWidths}
          setColumnWidth={handleSetColumnWidth}
          // Ordenamiento
          sorting={sorting}
          toggleSort={toggleSort}
          // Callbacks para ocultar cols/rows
          onHideColumns={onHideColumns}
          onHideRows={onHideRows}
        />
        <Pagination table={table} />
      </div>

      {/* Overlay si está cargando */}
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
