/**
 * Archivo: /components/CustomTable/index.js
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *   - Componente principal que orquesta la tabla y la barra de filtros.
 *   - Se apoya en hooks personalizados para lógica de filtrado, sorting, selección, etc.
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
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import useCellSelection from '../hooks/useCellSelection';

import FiltersToolbar from '../toolbar/FiltersToolbar';
import TableSection from '../TableView';

/* -------------------------------------------------------------------------- */
/*                          Definición de props y defaults                    */
/* -------------------------------------------------------------------------- */

/**
 * @typedef CustomTableProps
 * @property {Array<Object>}  data           - Datos (filas) a mostrar en la tabla.
 * @property {Array<Object>}  columnsDef     - Definición de columnas (incluyendo accessorKey, widths, etc.).
 * @property {string}         [themeMode='light']
 *   Modo de tema (light o dark) que define la apariencia inicial.
 *
 * @property {number}         [pageSize=50]
 *   Número de filas por página a mostrar en la paginación.
 *
 * @property {boolean}        [loading=false]
 *   Indica si la tabla se encuentra en estado de carga (muestra overlay).
 *
 * @property {Object}         [filtersToolbarProps]
 *   Props adicionales para la barra de filtros (FiltersToolbar).
 *
 * @property {Function}       [onRefresh]
 *   Callback opcional que se ejecuta al presionar el botón “Refrescar”.
 *
 * @property {boolean}        [showFiltersToolbar=true]
 *   Controla si se renderiza o no la barra de filtros superior.
 *
 * @property {Function}       [onHideColumns]
 *   Callback para ocultar columnas. Recibe la(s) columna(s) que se desea ocultar.
 *
 * @property {Function}       [onHideRows]
 *   Callback para ocultar filas. Recibe la(s) fila(s) que se desea ocultar.
 *
 * @property {string}         [containerHeight='400px']
 *   Altura (o altura máxima) del contenedor que envuelve la tabla. Puede ser “400px”, “60vh”, etc.
 *
 * @property {number}         [rowHeight=15]
 *   Altura de cada fila, en píxeles.
 *
 * @property {string}         [loadingText='Cargando...']
 *   Texto que se muestra cuando `loading` es true.
 *
 * @property {string}         [noResultsText='Sin resultados']
 *   Texto que se muestra cuando no hay filas que renderizar.
 *
 * @property {number}         [autoCopyDelay=1000]
 *   Retardo (en milisegundos) para realizar auto-copiado tras seleccionar celdas.
 */

/**
 * Componente CustomTable
 * @type {React.FC<CustomTableProps>}
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
  // 1) Modo de tema (claro u oscuro) controlado por custom hook
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  // 2) Lógica principal de la tabla (React Table) vía custom hook
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

  // 3) Selección de celdas y manejo de copiado (contenido en TableSection)
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

  // Copiadas por TableSection, pero mantenidas aquí para control global
  const [copiedCells, setCopiedCells] = useState([]);

  /**
   * getCellsInfo():
   * Mapeo de celdas <td> en el DOM -> información necesaria para selección
   * (posición x,y, ancho, alto, rowId, colField).
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

  // Listener de flechas en el contenedor (para mover selección con teclado)
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

  // 4) Render principal
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
        {/** Barra de filtros (opcional, sticky) */}
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
              // Props específicos del padre y la propia barra
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
         * Contenedor principal para TableSection, que es donde se
         * renderiza la tabla y la paginación sticky
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
            // Props de lógica interna
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

            // Props de presentación / personalización
            containerHeight={containerHeight}
            rowHeight={rowHeight}
            loadingText={loadingText}
            noResultsText={noResultsText}
            autoCopyDelay={autoCopyDelay}

            // Props relacionadas con la selección de celdas
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

        {/** Overlay de carga (por si deseas un spinner adicional en top-level) */}
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
