/************************************************************************************
 * Archivo: /hooks/useCellEditingOrchestration.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Hook que orquesta la edición de celdas, usando CellDataService por debajo.
 *   - Devuelve una función "handleConfirmCellEdit" que tu tabla puede invocar.
 *   - Devuelve también "loadLocalDataOrDefault" para inicializar tu state.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Se dedica a orquestar la edición y la carga inicial desde localStorage.
 *   - DIP: Recibe las instancias de los repositorios/servicio inyectados.
 ************************************************************************************/

import { useCallback } from 'react';

export function useCellEditingOrchestration(cellDataService) {
  /**
   * handleConfirmCellEdit
   * ------------------------------------------------------------------
   * - Recibe rowId (índice local), colId, newValue
   * - Usa el servicio para hacer update local + remoto (si dbId).
   *
   * @param {number|string} rowId    - Índice local que usas en tableData.
   * @param {string}        colId    - ID/clave de la columna.
   * @param {string}        newValue - Valor actualizado.
   * @param {Array<Object>} tableData - El estado actual de la tabla.
   * @param {Function}      setTableData - Setter de estado.
   */
  const handleConfirmCellEdit = useCallback(
    async (rowId, colId, newValue, tableData, setTableData) => {
      // Aseguramos que rowId sea entero, si te sirve
      const localRowIndex = parseInt(rowId, 10);
      if (isNaN(localRowIndex)) {
        console.warn(`handleConfirmCellEdit: rowId inválido (${rowId}).`);
        return;
      }

      const newRows = await cellDataService.updateCellValue(
        tableData,
        localRowIndex,
        colId,
        newValue,
      );

      // Actualizar estado con la versión final
      setTableData(newRows);
    },
    [cellDataService],
  );

  /**
   * loadLocalDataOrDefault
   * ------------------------------------------------------------------
   * - Dado un array proveniente de SSR, retorna la data local si existe.
   * @param {Array<Object>} currentRows
   */
  const loadLocalDataOrDefault = useCallback(
    (currentRows) => {
      return cellDataService.loadLocalDataOrDefault(currentRows);
    },
    [cellDataService],
  );

  return {
    handleConfirmCellEdit,
    loadLocalDataOrDefault,
  };
}
