/************************************************************************************
 * Archivo: /components/CustomTableRefactored/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Similar a tu "CustomTable", pero refactorizado para:
 *       1) Separar la lógica de edición en un hook y un servicio.
 *       2) Manejar rowId vs dbId (opcional) sin confundirlos.
 *   - Usa `useCellEditingOrchestration` para la confirmación de edición.
 *   - Evita duplicar código de acceso a localStorage y DB.
 *
 * PRINCIPIOS SOLID APLICADOS:
 * ----------------------------------------------------------------------------------
 *   - SRP, OCP, DIP, etc.
 *
 * VERSION:
 * ----------------------------------------------------------------------------------
 *   - 3.0
 *     - Incorporación de la capa de servicio y repositorios.
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect, createContext } from 'react';
import { useCustomTableLogic } from './hooks/useCustomTableLogic';
import { useThemeMode } from './hooks/useThemeMode';
import FiltersToolbar from './toolbar/FiltersToolbar';
import TableSection from './TableView'; // Tu sub-componente actual
import { useCellEditingOrchestration } from './hooks/useCellEditingOrchestration';

// Repos y Service
import { LocalTableDataRepository } from './repositories/LocalTableDataRepository';
import { RemoteCellUpdateRepository } from './repositories/RemoteCellUpdateRepository';
import { CellDataService } from './services/CellDataService';

/**
 * Contexto para proveer la función de confirmación de edición de celdas.
 * `useInlineCellEdit` la leerá desde aquí, sin alterar su firma.
 */
export const TableEditContext = createContext(null);

/**
 * @typedef {Object} CustomTableProps
 * @property {Array<Object>}  data           - Datos (filas) iniciales.
 * @property {Array<Object>}  columnsDef     - Definición de columnas.
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
 * CustomTableRefactored
 * ----------------------------------------------------------------------------------
 * @param {CustomTableProps} props
 */
export default function CustomTableRefactored({
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
  /************************************************************************************
   * 1) Preparar repositorios y servicio
   ************************************************************************************/
  const localRepo = new LocalTableDataRepository('myTableData');
  const remoteRepo = new RemoteCellUpdateRepository('/api/rows/updateCell');
  const cellDataService = new CellDataService(localRepo, remoteRepo);

  /************************************************************************************
   * 2) Hook de orquestación de edición
   ************************************************************************************/
  const { handleConfirmCellEdit, loadLocalDataOrDefault } =
    useCellEditingOrchestration(cellDataService);

  /************************************************************************************
   * 3) Estado local de la data (para SSR -> CSR)
   ************************************************************************************/
  const [tableData, setTableData] = useState(data);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Sobrescribimos con la data en localStorage (si existe) una vez montado en el cliente
    const loaded = loadLocalDataOrDefault(data);
    if (loaded) {
      setTableData(loaded);
    }
  }, [data, loadLocalDataOrDefault]);

  /************************************************************************************
   * 4) Proveer handleConfirmCellEdit a través de TableEditContext
   *    -> useInlineCellEdit lo leerá sin cambiar su firma
   ************************************************************************************/
  const handleConfirmEditCellContext = (rowId, colId, newValue) => {
    if (!isHydrated) return;
    handleConfirmCellEdit(rowId, colId, newValue, tableData, setTableData);
  };

  /************************************************************************************
   * 5) Modo de tema
   ************************************************************************************/
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } =
    useThemeMode(themeMode);

  /************************************************************************************
   * 6) Lógica de la tabla con react-table: useCustomTableLogic
   *    -> Pásale tableData en lugar de data
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
   * 7) Render
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

        {/* [B] Contenedor principal de la tabla */}
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

        {/* [C] Overlay de carga (opcional) */}
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
    </TableEditContext.Provider>
  );
}
