/**
 * Archivo: /components/CustomTable/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   - Componente principal que orquesta la tabla y la barra de filtros.
 *   - La paginación se ha movido a `TableView` (aquí llamado `TableSection`),
 *     para centralizar la lógica de scroll y selección.
 *
 * FUNCIONALIDADES:
 *   - Configura el tema (claro/oscuro).
 *   - Usa `useCustomTableLogic` para obtener la instancia de la tabla (sorting, filtering, etc.).
 *   - Opcionalmente muestra la barra de filtros (FiltersToolbar).
 *   - Renderiza `TableView` (aquí `TableSection`), que incluye la paginación sticky.
 *
 * PARÁMETROS (props):
 *   - data (array): filas de la tabla.
 *   - columnsDef (array): definición de columnas.
 *   - themeMode (string): "light" o "dark".
 *   - pageSize (number): filas por página.
 *   - loading (boolean): indica si está cargando.
 *   - filtersToolbarProps (object): props adicionales para FiltersToolbar.
 *   - onRefresh (function): callback del botón "Refrescar".
 *   - showFiltersToolbar (boolean): mostrar/ocultar la barra de filtros.
 *   - onHideColumns (function): callback para ocultar columnas.
 *   - onHideRows (function): callback para ocultar filas.
 *
 *   - containerHeight (string): altura (o altura máxima) que queremos usar
 *     en TableView (ej: "500px", "60vh", "calc(100vh - 100px)", etc.).
 *     Por defecto, "400px".
 *
 * @version 1.2
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import useCellSelection from '../hooks/useCellSelection';

// Barra de filtros (parte superior)
import FiltersToolbar from '../toolbar/FiltersToolbar';

// El componente que renderiza la tabla real y la paginación sticky
import TableSection from '../TableView';

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
  /**
   * Nuevo prop: altura a usar en TableSection.
   * Por defecto, "400px" si no se pasa nada.
   */
  containerHeight = '400px',
}) {
  //
  // 1) Modo de tema (claro/oscuro)
  //
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  //
  // 2) Lógica principal (React Table) desde el custom hook
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
  //    (Se mantiene aquí para orquestar, aunque la UI esté en TableView)
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

  /**
   * getCellsInfo():
   * Requerida por useCellSelection para mapear el DOM a coordenadas de celdas
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
  // 4) Render principal
  //
  return (
    <>
      {/* Contenedor general con clase de tema (sin forzar altura aquí) */}
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          // Notamos que aquí NO usamos "height: containerHeight"
          // para no forzar la altura de todo el componente.
          // Sólo lo pasaremos a TableSection.
        }}
      >
        {/* Barra de filtros (opcional) con sticky top */}
        {showFiltersToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 9999,
              backgroundColor: 'var(--color-bg-paper)',
              borderBottom: `1px solid var(--color-divider)`,
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

        {/* Contenedor para la tabla + paginación (TableView) */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            // No forzamos altura, dejamos que TableView la maneje
          }}
        >
          <TableSection
            table={table}
            // Le pasamos la altura deseada
            containerHeight={containerHeight}
            // Filtros por columna
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

        {/* Overlay de carga */}
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
