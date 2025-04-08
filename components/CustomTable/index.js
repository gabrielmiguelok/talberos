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
 *   - SRP (Single Responsibility Principle): Se encarga de orquestar la configuración
 *       general de la tabla (tema, edición, repositorios, etc.).
 *   - OCP (Open/Closed Principle): Es fácil de extender (por ej. con nuevas props)
 *       sin modificar su núcleo.
 *   - DIP (Dependency Inversion): Se inyectan dependencias como repos y servicios.
 *   - DRY: Evita duplicar la lógica de edición, ya que se delega al hook.
 *
 * VERSION:
 * ----------------------------------------------------------------------------------
 *   - 3.1 (refactor con repos + servicios, + "isDarkMode" propagado).
 *
 ************************************************************************************/

import React, { useRef, useState, useEffect, createContext } from 'react';
import { useCustomTableLogic } from './hooks/useCustomTableLogic';  // Hook de React Table (sorting/filtros)
import { useThemeMode } from './hooks/useThemeMode';               // Hook para tema claro/oscuro
import FiltersToolbar from './toolbar/FiltersToolbar';             // Barra de filtros
import TableSection from './TableView';                           // Sub-componente principal (Tabla)
import { useCellEditingOrchestration } from './hooks/useCellEditingOrchestration';

// Repos y servicios
import { LocalTableDataRepository } from './repositories/LocalTableDataRepository';
import { RemoteCellUpdateRepository } from './repositories/RemoteCellUpdateRepository';
import { CellDataService } from './services/CellDataService';

/**
 * Contexto que provee la función "handleConfirmCellEdit" para editar celdas.
 * El hook "useInlineCellEdit" (o en el cuerpo de la tabla) la leerá sin
 * cambiar su firma, delegando la implementación a este componente.
 */
export const TableEditContext = createContext(null);

/**
 * @typedef {Object} CustomTableProps
 * @property {Array<Object>}  data               - Filas iniciales (SSR o fetch).
 * @property {Array<Object>}  columnsDef         - Definición de columnas para React Table.
 * @property {string}         [themeMode='light']- Modo de tema inicial ('light' o 'dark').
 * @property {number}         [pageSize=500]     - Tamaño de página de la tabla.
 * @property {boolean}        [loading=false]    - Indica si se está cargando.
 * @property {Object}         [filtersToolbarProps] - Props extras para la barra de filtros.
 * @property {Function}       [onRefresh]        - Callback para refrescar datos.
 * @property {boolean}        [showFiltersToolbar=true] - Muestra/oculta la barra de filtros.
 * @property {Function}       [onHideColumns]    - Callback para ocultar columnas.
 * @property {Function}       [onHideRows]       - Callback para ocultar filas.
 * @property {string}         [containerHeight='750px'] - Alto del contenedor de la tabla.
 * @property {number}         [rowHeight=15]     - Altura de las filas en px.
 * @property {string}         [loadingText='Cargando...'] - Texto mientras carga.
 * @property {string}         [noResultsText='Sin resultados'] - Texto si no hay datos.
 * @property {number}         [autoCopyDelay=1000] - Delay para "autoCopy".
 */

/**
 * CustomTable
 * ----------------------------------------------------------------------------------
 * Componente principal que unifica:
 *  - Tema claro/oscuro (useThemeMode)
 *  - Orquestación de edición local/remota (useCellEditingOrchestration)
 *  - React Table (filtros, sorting) vía useCustomTableLogic
 *  - Barra de filtros (FiltersToolbar)
 *  - Render final de la tabla (TableSection)
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
   * 1) Instanciar repositorios y servicio para edición de celdas
   ************************************************************************************/
  const localRepo = new LocalTableDataRepository('myTableData');
  const remoteRepo = new RemoteCellUpdateRepository('/api/user/update');
  const cellDataService = new CellDataService(localRepo, remoteRepo);

  /************************************************************************************
   * 2) Hook de orquestación de edición (useCellEditingOrchestration)
   ************************************************************************************/
  const { handleConfirmCellEdit, loadLocalDataOrDefault } =
    useCellEditingOrchestration(cellDataService);

  /************************************************************************************
   * 3) Estado local para almacenar la data en la tabla y control de hidratación
   ************************************************************************************/
  const [tableData, setTableData] = useState(data);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Cargar data de localStorage si existe, sobrescribiendo la proveniente de SSR
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
   * 5) Manejo de tema (claro/oscuro) con el hook useThemeMode
   ************************************************************************************/
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } =
    useThemeMode(themeMode);

  /************************************************************************************
   * 6) Lógica de React Table (sorting, filtros, descargas) con useCustomTableLogic
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
        {/*
          [A] Barra de filtros (opcional).
          Incluye:
            - Filtro global.
            - Descarga Excel.
            - Refresh.
            - Toggle tema claro/oscuro.
        */}
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

        {/*
          [B] Contenedor principal (tabla + paginación).
          Se pasa "isDarkMode" a <TableSection> para que las filas
          puedan cambiar de color (claro/oscuro).
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
            // ¡IMPORTANTE! Aquí propagamos el isDarkMode
            isDarkMode={isDarkMode}
          />
        </div>

        {/*
          [C] Overlay de carga, si loading = true
        */}
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

      {/* Animación (p.ej. overlay de carga pulsante) */}
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
