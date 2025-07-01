/************************************************************************************
 * Archivo: /services/CellDataService.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Servicio que orquesta la lógica de edición de celdas.
 *   - Usa LocalTableDataRepository para leer/escribir en localStorage.
 *   - Usa RemoteCellUpdateRepository para actualizar la BD.
 *
 *   IMPORTANTÍSIMO:
 *   - Aquí asumimos que `row.id` es realmente el ID en la BD.
 *   - Si tu columna "id" no es la de la BD, debes ajustar la lógica.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Se enfoca en la edición de celdas y la sincronización local/remota.
 *   - DIP: Depende de repos inyectados (local y remoto), sin atarse a implementaciones concretas.
 ************************************************************************************/

export class CellDataService {
  /**
   * @param {LocalTableDataRepository} localRepo
   * @param {RemoteCellUpdateRepository} remoteRepo
   */
  constructor(localRepo, remoteRepo) {
    this.localRepo = localRepo;
    this.remoteRepo = remoteRepo;
  }

  /**
   * updateCellValue
   * ----------------------------------------------------------------------------
   * Actualiza el valor de la celda en:
   *   1) El array en memoria (currentRows),
   *   2) localStorage (vía localRepo),
   *   3) BD (vía remoteRepo) => usando row.id como ID de la tabla.
   *
   * @param {Array<Object>} currentRows   - estado actual de filas (tableData).
   * @param {number}        localRowIndex - índice en el array (0..length-1).
   * @param {string}        colId         - nombre/clave de la columna.
   * @param {string}        newValue      - valor nuevo a asignar.
   * @returns {Array<Object>}             - nuevo array de filas tras la edición.
   */
  async updateCellValue(currentRows, localRowIndex, colId, newValue) {
    // 1) Validaciones
    if (!Array.isArray(currentRows)) {
      console.warn('CellDataService.updateCellValue: currentRows no es un array.');
      return currentRows;
    }
    if (localRowIndex < 0 || localRowIndex >= currentRows.length) {
      console.warn(`CellDataService.updateCellValue: Índice inválido = ${localRowIndex}`);
      return currentRows;
    }

    const row = currentRows[localRowIndex];
    const oldValue = row[colId] ?? '';

    // 2) Normalizar y chequear cambios
    const safeNewValue = String(newValue || '').trim();
    if (!safeNewValue) {
      console.warn(`Valor nuevo vacío. No se actualiza [${localRowIndex}, ${colId}].`);
      return currentRows;
    }
    if (safeNewValue === String(oldValue).trim()) {
      console.warn(`Sin cambios en la celda [${localRowIndex}, ${colId}].`);
      return currentRows;
    }

    // 3) Clonar y actualizar en memoria
    const updatedRows = [...currentRows];
    updatedRows[localRowIndex] = {
      ...row,
      [colId]: safeNewValue,
    };

    // 4) Guardar en localStorage
    this.localRepo.saveAllRows(updatedRows);

    // 5) Actualizar remotamente usando row.id como ID de BD
    //    Asegúrate de que `row.id` sea el campo que corresponde en la DB
    const dbId = row.id;
    if (dbId == null) {
      console.warn(
        `No existe un 'id' en la fila localRowIndex=${localRowIndex}. No se hace POST remoto.`
      );
    } else {
      try {
        // Llamamos al repo remoto
        await this.remoteRepo.updateCell(dbId, colId, safeNewValue);
      } catch (error) {
        console.error('Error actualizando en la DB:', error);
        // Podrías revertir cambio local si quieres
      }
    }

    return updatedRows;
  }

  /**
   * Carga desde localStorage si existe, caso contrario, usa currentRows
   */
  loadLocalDataOrDefault(currentRows) {
    const savedRows = this.localRepo.getAllRows();
    if (Array.isArray(savedRows) && savedRows.length > 0) {
      return savedRows;
    }
    return currentRows;
  }
}
