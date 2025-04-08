/************************************************************************************
 * Archivo: /components/CustomTable/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Tabla refactorizada con lógica de edición local + remota.
 *   - Separa la edición en un hook (`useCellEditingOrchestration`) + servicios.
 *   - Conserva la idea de localStorage, y llama al back si hay un dbId en la fila.
 *
 * PRINCIPIOS SOLID APLICADOS:
 * ----------------------------------------------------------------------------------
 *   - SRP, OCP, DIP, etc.
 *   - DRY: Evitamos duplicar la lógica para "confirmar edición".
 *
 * VERSION:
 * ----------------------------------------------------------------------------------
 *   - 3.0 (refactor con repos + servicios).
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect, createContext } from 'react';
import { useCustomTableLogic } from './hooks/useCustomTableLogic'; // tu hook de React Table
import { useThemeMode } from './hooks/useThemeMode';              // tu hook de tema
import FiltersToolbar from './toolbar/FiltersToolbar';            // barra de filtros
import TableSection from './TableView';                           // sub-componente principal
import { useCellEditingOrchestration } from './hooks/useCellEditingOrchestration';

// Repos y Service
import { LocalTableDataRepository } from './repositories/LocalTableDataRepository';
import { RemoteCellUpdateRepository } from './repositories/RemoteCellUpdateRepository';
import { CellDataService } from './services/CellDataService';

/**
 * Contexto que provee la función "handleConfirmCellEdit" para editar celdas.
 * El hook "useInlineCellEdit" (o tu TableBody) la leerá directamente sin
 * cambiar su firma.
 */
export const TableEditContext = createContext(null);

/**
 * @typedef {Object} CustomTableProps
 * @property {Array<Object>}  data                   - Array de filas iniciales (SSR o fetch).
 * @property {Array<Object>}  columnsDef             - Definición de columnas para React Table.
 * @property {string}         [themeMode='light']
 * @property {number}         [pageSize=50]
 * @property {boolean}        [loading=false]
 * @property {Object}         [filtersToolbarProps]
 * @property {Function}       [onRefresh]
 * @property {boolean}        [showFiltersToolbar=true]
 * @property {Function}       [onHideColumns]
 * @property {Function}       [onHideRows]
 * @property {string}         [containerHeight='400px']
 * @property {number}         [rowHeight=15]
 * @property {string}         [loadingText='Cargando...']
 * @property {string}         [noResultsText='Sin resultados']
 * @property {number}         [autoCopyDelay=1000]
 */

/**
 * CustomTable
 * ----------------------------------------------------------------------------
 * Envuelve toda la lógica de la tabla (filtros, sorting, edición de celdas, etc.).
 */
export default function CustomTable({
  data,
  columnsDef,
  themeMode = 'light',
  pageSize = 500,
  loading = false,
  filtersToolbarProps,
  onRefresh,
  showFiltersToolbar = true,
  onHideColumns,
  onHideRows,
  containerHeight = '750px',
  rowHeight = 15,
  loadingText = 'Cargando...',
  noResultsText = 'Sin resultados',
  autoCopyDelay = 1000,
}) {
  /************************************************************************************
   * 1) Instanciar repositorios y servicio
   ************************************************************************************/
  const localRepo = new LocalTableDataRepository('myTableData');
  // Ajusta la ruta de tu endpoint remoto para actualizar la DB:
  const remoteRepo = new RemoteCellUpdateRepository('/api/user/update');

  const cellDataService = new CellDataService(localRepo, remoteRepo);

  /************************************************************************************
   * 2) Hook de orquestación (edición de celdas)
   ************************************************************************************/
  const { handleConfirmCellEdit, loadLocalDataOrDefault } =
    useCellEditingOrchestration(cellDataService);

  /************************************************************************************
   * 3) Estado local de la data y control de hidratación
   ************************************************************************************/
  const [tableData, setTableData] = useState(data);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Cargamos cualquier data que exista en localStorage (prioridad) sobre la del SSR
    const loaded = loadLocalDataOrDefault(data);
    if (loaded) {
      setTableData(loaded);
    }
  }, [data, loadLocalDataOrDefault]);

  /************************************************************************************
   * 4) Proveer handleConfirmCellEdit mediante Context
   ************************************************************************************/
  const handleConfirmEditCellContext = (rowId, colId, newValue) => {
    if (!isHydrated) return;
    handleConfirmCellEdit(rowId, colId, newValue, tableData, setTableData);
  };

  /************************************************************************************
   * 5) Manejo de tema (claro/oscuro) con tu hook useThemeMode
   ************************************************************************************/
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } =
    useThemeMode(themeMode);

  /************************************************************************************
   * 6) Lógica de la tabla con React Table (useCustomTableLogic)
   ************************************************************************************/
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
  } = useCustomTableLogic({
    data: tableData,
    columnsDef,
    pageSize,
  });

  const containerRef = useRef(null);

  /************************************************************************************
   * 7) Render Final
   ************************************************************************************/
  return (
    <TableEditContext.Provider value={{ handleConfirmCellEdit: handleConfirmEditCellContext }}>
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* [A] Barra de filtros (opcional) */}
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

        {/* [B] Contenedor principal (tabla + paginación) */}
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
            containerHeight={containerHeight}
            rowHeight={rowHeight}
            loadingText={loadingText}
            noResultsText={noResultsText}
            autoCopyDelay={autoCopyDelay}
            containerRef={containerRef}
          />
        </div>

        {/* [C] Overlay de carga */}
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

      {/* Animación */}
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
    </TableEditContext.Provider>
  );
}
