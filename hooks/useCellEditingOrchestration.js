/************************************************************************************
 * Archivo: /hooks/useCellEditingOrchestration.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Hook que orquesta la edición de celdas, usando CellDataService por debajo.
 *   - Devuelve:
 *       (a) handleConfirmCellEdit(...) para confirmar la edición de una celda.
 *       (b) loadLocalDataOrDefault(...) para inicializar tu estado desde localStorage.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Se dedica a orquestar la edición y la carga inicial desde localStorage.
 *   - DIP: Recibe la instancia del servicio (cellDataService) por inyección.
 ************************************************************************************/

import { useCallback } from 'react';

export function useCellEditingOrchestration(cellDataService) {
  /**
   * handleConfirmCellEdit
   * ------------------------------------------------------------------
   * Maneja la confirmación de la edición de una celda.
   *  1) rowId: índice local de la fila (no el id de BD).
   *  2) colId: identificador de la columna.
   *  3) newValue: valor nuevo a guardar.
   *  4) tableData: array de filas que tienes en el state.
   *  5) setTableData: setter de ese state.
   */
  const handleConfirmCellEdit = useCallback(
    async (rowId, colId, newValue, tableData, setTableData) => {
      // rowId suele ser el índice local, lo convertimos a entero
      const localRowIndex = parseInt(rowId, 10);
      if (isNaN(localRowIndex)) {
        console.warn(`handleConfirmCellEdit: rowId inválido (${rowId}).`);
        return;
      }

      // Pedimos al servicio que actualice localmente y remoto
      const updatedRows = await cellDataService.updateCellValue(
        tableData,
        localRowIndex,
        colId,
        newValue
      );

      // Guardamos en el state la nueva versión
      setTableData(updatedRows);
    },
    [cellDataService]
  );

  /**
   * loadLocalDataOrDefault
   * ------------------------------------------------------------------
   *  - Si hay datos guardados en localStorage, los carga.
   *  - De lo contrario, retorna los que llegan desde SSR (o prop).
   */
  const loadLocalDataOrDefault = useCallback(
    (currentRows) => {
      return cellDataService.loadLocalDataOrDefault(currentRows);
    },
    [cellDataService]
  );

  return {
    handleConfirmCellEdit,
    loadLocalDataOrDefault,
  };
}
