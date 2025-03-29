/**
 * Archivo: /components/CustomTable/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   - Componente principal que orquesta la tabla y la barra de filtros.
 *   - Se apoya en hooks personalizados para la lógica de filtrado, sorting, selección, etc.
 *   - Muestra la barra de filtros (FiltersToolbar) si se indica.
 *   - Renderiza `TableSection` (sub-componente) donde está la tabla real y la paginación.
 *
 * PROPÓSITO:
 *   - Centralizar la configuración y lógica de la tabla (filtros, sorting, etc.)
 *     para inyectar todo a `TableSection` (que se encarga de la vista pura).
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   - SRP (Single Responsibility Principle): Se encarga de orquestar la lógica
 *     de la tabla y manejar la barra de filtros, sin encargarse directamente
 *     del renderizado detallado (eso es labor de `TableSection`).
 *   - OCP (Open-Closed Principle): Preparado para recibir nuevas props que
 *     extiendan la personalización, sin modificar código interno.
 *   - DIP (Dependency Inversion Principle): Recibe todo (datos, configuraciones)
 *     por props y usa hooks con dependencia invertida, facilitando la mantenibilidad.
 *
 * @version 1.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import FiltersToolbar from '../toolbar/FiltersToolbar';

// Sub-componente que renderiza la tabla y paginación sticky
import TableSection from '../TableView'; // <- Este import apunta al archivo "TableView" de más abajo

// Hook de selección de celdas (Excel-like)
import useCellSelection from '../hooks/useCellSelection';

/**
 * @typedef {Object} CustomTableProps
 * @property {Array<Object>}  data           - Datos (filas) a mostrar en la tabla.
 * @property {Array<Object>}  columnsDef     - Definición de columnas (accessorKey, width, etc.).
 * @property {string}         [themeMode='light']
 *   Modo de tema (light o dark) que define la apariencia inicial.
 * @property {number}         [pageSize=50]
 *   Número de filas por página (para la paginación de react-table).
 * @property {boolean}        [loading=false]
 *   Indica si la tabla está en estado de carga (muestra overlay).
 * @property {Object}         [filtersToolbarProps]
 *   Props adicionales para la barra de filtros (FiltersToolbar).
 * @property {Function}       [onRefresh]
 *   Callback opcional que se ejecuta al presionar “Refrescar”.
 * @property {boolean}        [showFiltersToolbar=true]
 *   Controla si se renderiza o no la barra de filtros superior.
 * @property {Function}       [onHideColumns]
 *   Callback para ocultar columnas. Recibe la(s) columna(s) que se desea ocultar.
 * @property {Function}       [onHideRows]
 *   Callback para ocultar filas. Recibe la(s) fila(s) que se desea ocultar.
 * @property {string}         [containerHeight='400px']
 *   Altura del contenedor que envuelve la tabla (p. ej. '400px', '60vh').
 * @property {number}         [rowHeight=15]
 *   Altura de cada fila, en píxeles.
 * @property {string}         [loadingText='Cargando...']
 *   Texto mostrado cuando `loading` es true.
 * @property {string}         [noResultsText='Sin resultados']
 *   Texto mostrado cuando no hay filas que renderizar.
 * @property {number}         [autoCopyDelay=1000]
 *   Retardo (ms) para el auto-copiado tras seleccionar celdas.
 */

/**
 * Componente CustomTable
 * --------------------------------------------------------------------------
 * Orquesta la creación de la instancia react-table, la barra de filtros,
 * y la visualización en TableSection.
 *
 * @param {CustomTableProps} props - Props de configuración.
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
  containerHeight = '400px',
  rowHeight = 15,
  loadingText = 'Cargando...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
}) {
  // 1) Manejo del modo de tema (claro u oscuro)
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  // 2) Hook principal con la lógica de la tabla (filtros, sorting, etc.)
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

  // 3) Selección “excel-like”: definimos el containerRef y conectamos con useCellSelection
  const containerRef = useRef(null);

  // useCellSelection (sin modificar) se encarga de la lógica de arrastre, shift, flechas...
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

  // Manejo de celdas copiadas (p. ej. celdas que se resaltan al copy)
  const [copiedCells, setCopiedCells] = useState([]);

  // 4) getCellsInfo => Mapea <td data-row data-col> a { id, colField, x, y, etc. }
  function getCellsInfo() {
    if (!containerRef.current) return [];
    const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
    const cells = [];

    // Obtenemos las filas de la tabla (paginadas, ordenadas, etc.)
    const tableRows = table.getRowModel().rows;

    cellEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const rowIndexStr = el.getAttribute('data-row');
      const cIndex = parseInt(el.getAttribute('data-col'), 10);

      if (rowIndexStr == null || isNaN(cIndex) || rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const rowIndex = parseInt(rowIndexStr, 10);
      const rowObj = tableRows[rowIndex];
      if (!rowObj) return;

      // Obtenemos el rowId real. Podría ser "0", "1", etc. o un string único.
      const rowId = rowObj.id;
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

  // Para mover la selección con flechas (en el contenedor)
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

  // 5) Render final
  return (
    <>
      {/* Contenedor global que controla la apariencia (light/dark) */}
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/** Barra de filtros (opcional) */}
        {showFiltersToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 9999,
              backgroundColor: 'var(--color-bg-paper)',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <FiltersToolbar
              // Props específicos
              {...(filtersToolbarProps || {})}
              globalFilterValue={tempGlobalFilter}
              onGlobalFilterChange={setTempGlobalFilter}
              onDownloadExcel={handleDownloadExcel}
              onRefresh={onRefresh}
              // Manejo de tema
              isDarkMode={isDarkMode}
              onThemeToggle={toggleThemeMode}
            />
          </div>
        )}

        {/**
         * Contenedor principal para TableSection, que incluye la tabla real
         * y la paginación sticky al final.
         */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <TableSection
            // Lógica interna
            table={table}
            loading={loading}
            columnFilters={columnFilters}
            updateColumnFilter={(colId, filterValue) =>
              setColumnFilters((prev) => ({
                ...prev,
                [colId]: { ...prev[colId], ...filterValue },
              }))
            }
            columnsDef={finalColumns}
            originalColumnsDef={finalColumns}
            columnWidths={columnWidths}
            setColumnWidth={handleSetColumnWidth}
            onHideColumns={onHideColumns}
            onHideRows={onHideRows}
            sorting={sorting}
            toggleSort={toggleSort}

            // Props de presentación
            containerHeight={containerHeight}
            rowHeight={rowHeight}
            loadingText={loadingText}
            noResultsText={noResultsText}
            autoCopyDelay={autoCopyDelay}

            // Props para selección
            containerRef={containerRef}
            selectedCells={selectedCells}
            setSelectedCells={setSelectedCells}
            anchorCell={anchorCell}
            focusCell={focusCell}
            setFocusCell={setFocusCell}
            setAnchorCell={setAnchorCell}
            copiedCells={copiedCells}
            setCopiedCells={setCopiedCells}
          />
        </div>

        {/** Overlay de carga global (opcional) */}
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
