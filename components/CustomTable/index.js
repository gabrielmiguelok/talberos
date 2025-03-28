/**
 * Archivo: /components/CustomTable/index.js
 * Descripción:
 *  - Componente principal que orquesta la tabla, la barra de filtros y la paginación.
 *  - La barra de filtros y la paginación se mantienen siempre visibles (sticky).
 *  - La tabla se desplaza dentro de un contenedor con overflow dinámico (flex: 1).
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import useCellSelection from '../hooks/useCellSelection';

// Componentes
import FiltersToolbar from '../toolbar/FiltersToolbar';
import TableSection from '../TableView';
import Pagination from './Pagination';

export default function CustomTable({
  data,
  columnsDef,
  themeMode = 'light',
  pageSize = 10,
  loading = false,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
}) {
  //
  // 1) Modo de tema (claro/oscuro)
  //
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  //
  // 2) Lógica principal (React Table)
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
  // 3) Selección de celdas y copiado
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

  // Listener de teclas (flechas) en el contenedor
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Solo proceder si el foco está dentro del contenedor
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
  // 4) Render del componente
  //
  return (
    <>
      {/* Contenedor general (flex column) con clase de tema */}
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Barra de filtros (sticky en la parte superior) */}
        {showFiltersToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 9999,
              backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
              borderBottom: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
            }}
          >
            <FiltersToolbar
              {...(filtersToolbarProps || {})}
              globalFilterValue={tempGlobalFilter}
              onGlobalFilterChange={setTempGlobalFilter}
              onDownloadExcel={handleDownloadExcel}
              onRefresh={onRefresh}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleThemeMode}
            />
          </div>
        )}

        {/* Contenedor scrolleable de la tabla (flex: 1) */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: 'auto',
            // Evitar que la parte final quede tapada por la paginación
            paddingBottom: '70px',
            filter: loading ? 'blur(2px)' : 'none',
            transition: 'filter 0.2s ease-in-out',
          }}
        >
          <TableSection
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
            // Loading
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
        </div>

        {/* Barra de paginación (sticky en la parte inferior) */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            zIndex: 9999,
            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
            borderTop: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
            padding: '8px',
          }}
        >
          <Pagination table={table} />
        </div>

        {/* Overlay de "cargando" */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: 0,
              right: 0,
              bottom: 0,
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
      </div>

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
    </>
  );
}
