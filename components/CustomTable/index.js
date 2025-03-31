/************************************************************************************
 * Archivo: /components/CustomTable/index.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Componente principal que orquesta la tabla y la barra de filtros.
 *   - Centraliza la configuración (filtrado, sorting, etc.) con el hook `useCustomTableLogic`.
 *   - Muestra la barra de filtros (FiltersToolbar) si se indica.
 *   - Renderiza `TableSection` (sub-componente) donde se muestra la tabla real y paginación.
 *   - Ahora, adicionalmente, mantiene los datos en un estado local `tableData` y
 *     persiste los cambios de edición en localStorage para que los cambios perduren,
 *     evitando errores de hidratación en Next.js.
 *
 * PROPÓSITO:
 * ----------------------------------------------------------------------------------
 *   - Entregar una "tabla personalizada" que ofrece filtrado global, sorting,
 *     barra de herramientas (descarga Excel, refresh, etc.) y luego delega el
 *     render de la tabla en `TableSection`.
 *
 * PRINCIPIOS SOLID APLICADOS:
 * ----------------------------------------------------------------------------------
 *   - SRP (Single Responsibility Principle):
 *       Únicamente orquesta la lógica de la tabla (filtros, sorting, etc.),
 *       el manejo de la barra de filtros y la persistencia en localStorage.
 *   - OCP (Open-Closed Principle):
 *       Soporta extensiones (props adicionales) sin modificar el código interno.
 *   - DIP (Dependency Inversion Principle):
 *       Todas las dependencias (datos, configuraciones, callbacks) se inyectan por props
 *       y se comunican a través del contexto para la edición en línea.
 *
 * Versión:
 * ----------------------------------------------------------------------------------
 *   - 2.1
 *     - Se agregó lógica para evitar Hydration Error en Next.js, leyendo `localStorage`
 *       sólo tras la hidratación, mediante `useEffect` y `isHydrated`.
 *
 ************************************************************************************/

import React, {
  useRef,
  useState,
  useEffect,
  createContext
} from 'react';
import { useCustomTableLogic } from '../hooks/useCustomTableLogic';
import { useThemeMode } from '../hooks/useThemeMode';
import FiltersToolbar from '../toolbar/FiltersToolbar';
import TableSection from '../TableView';

/**
 * Contexto para proveer la función de confirmación de edición de celdas.
 * Esto nos permite guardar cambios en localStorage sin alterar las firmas
 * de `TableView` ni de `useInlineCellEdit`.
 */
export const TableEditContext = createContext(null);

/**
 * @typedef {Object} CustomTableProps
 * @property {Array<Object>}  data           - Datos (filas) a mostrar en la tabla, proveniente del SSR o del padre.
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
 * ----------------------------------------------------------------------------------
 * Orquesta la instancia de `react-table` (filtros, sorting, etc.) y la renderiza con
 * una barra de filtros (opcional) y el subcomponente `TableSection`.
 *
 * ADICIONALMENTE:
 * ----------------------------------------------------------------------------------
 *   - Utiliza un estado local `tableData` con valor inicial `data` (el mismo que viene
 *     desde SSR o del padre), para evitar discrepancias en SSR.
 *   - Mediante `useEffect`, después de la hidratación (`isHydrated`), se lee localStorage
 *     para sobreescribir `tableData`. Así se evitan errores de hidratación en Next.js.
 *   - Provee la función `handleConfirmCellEdit` a través de un Contexto
 *     (`TableEditContext.Provider`) para que el hook `useInlineCellEdit` la utilice
 *     sin necesidad de alterar sus parámetros.
 *
 * @param {CustomTableProps} props - Props de configuración del componente.
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
  /************************************************************************************
   * [A] GESTIÓN DE ESTADO LOCAL DE LA DATA SIN ROMPER SSR -> useEffect para localStorage
   ************************************************************************************/
  // 1) Estado base con la data que viene del SSR o del padre (para que coincida en la hidratación)
  const [tableData, setTableData] = useState(data);

  // 2) Saber si ya estamos en cliente (hidratado) -> evitamos diferencias SSR vs Cliente
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marcar como "hidratado" (ya en cliente)
    setIsHydrated(true);

    // Leer de localStorage para "pisar" la data inicial si existe algo guardado
    try {
      const saved = localStorage.getItem('myTableData');
      if (saved) {
        setTableData(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Error leyendo datos de localStorage:', error);
    }
  }, []);

  /**
   * handleConfirmCellEdit
   * ------------------------------------------------------------------
   * Función que confirma la edición de una celda (rowId, colId) con un valor nuevo.
   * Actualiza el estado local `tableData` y persiste los cambios en localStorage.
   *
   * @param {string|number} rowId   - ID o índice de la fila que se editó.
   * @param {string}        colId   - ID de la columna (accessorKey).
   * @param {string}        newValue- Valor actualizado.
   */
  const handleConfirmCellEdit = (rowId, colId, newValue) => {
    // Si no estamos hidratados aún, evitar inconsistencias (opcional).
    if (!isHydrated) return;

    setTableData((prev) => {
      // Asumiendo que rowId sea un string convertible a number (React Table a menudo usa strings).
      const rowIndex = parseInt(rowId, 10);
      if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= prev.length) {
        console.warn(`handleConfirmCellEdit: rowId inválido (${rowId}). No se hace nada.`);
        return prev;
      }

      const newData = [...prev];
      const currentRow = newData[rowIndex];
      newData[rowIndex] = {
        ...currentRow,
        [colId]: newValue,
      };

      try {
        localStorage.setItem('myTableData', JSON.stringify(newData));
      } catch (error) {
        console.warn('Error guardando en localStorage:', error);
      }

      return newData;
    });
  };

  /************************************************************************************
   * [B] GESTIÓN DE MODO DE TEMA (CLARO/OSCURO)
   ************************************************************************************/
  const { themeMode: internalMode, isDarkMode, toggleThemeMode } = useThemeMode(themeMode);

  /************************************************************************************
   * [C] LÓGICA DE LA TABLA (filtros, sorting, etc.) vía useCustomTableLogic
   * ------------------------------------------------------------------
   * Se le pasa `tableData` en vez de la prop original `data`, para que la tabla lea
   * siempre los datos actualizados y persistidos.
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
    filteredData,
  } = useCustomTableLogic({
    data: tableData,
    columnsDef,
    pageSize,
  });

  /************************************************************************************
   * [D] Durante la hidratación, puedes optar por no renderizar la tabla
   *     para garantizar coincidencia SSR/Cliente (opcional).
   ************************************************************************************/
  // if no deseas mostrar nada hasta hidratar, descomenta:
  // if (!isHydrated) {
  //   return null; // o un pequeño "Cargando..."
  // }

  /************************************************************************************
   * [E] CONTENEDOR REF
   * ------------------------------------------------------------------
   * Sirve como referencia si TableSection necesita operar sobre
   * el scrolling u otras interacciones internas.
   ************************************************************************************/
  const containerRef = useRef(null);

  /************************************************************************************
   * [F] RENDER ENVUELTO EN TableEditContext
   ************************************************************************************/
  return (
    <TableEditContext.Provider value={{ handleConfirmCellEdit }}>
      <div
        className={`customTableContainer ${isDarkMode ? 'tabla-dark' : 'tabla-light'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/**
         * Barra de filtros (opcional)
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
              // Props particulares de la toolbar (ej: placeholder, labels)
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
         * Contenedor principal para la "sección de tabla"
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
            // Lógica y data principal
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

            // Presentación
            containerHeight={containerHeight}
            rowHeight={rowHeight}
            loadingText={loadingText}
            noResultsText={noResultsText}
            autoCopyDelay={autoCopyDelay}

            // Otros props (referencia al contenedor, etc.)
            containerRef={containerRef}
          />
        </div>

        {/**
         * Overlay global de carga (opcional)
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

      {/**
       * Animación pulse para el icono de carga
       */}
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
