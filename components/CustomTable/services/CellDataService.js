/************************************************************************************
 * Archivo: /services/CellDataService.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Servicio que orquesta la lógica de edición de celdas.
 *   - Usa LocalTableDataRepository para leer/escribir localStorage.
 *   - Usa RemoteCellUpdateRepository para actualizar la DB si existe dbId.
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Focalizado en la edición de celdas, sin mezclar otros temas.
 *   - DIP: Recibe repositorios inyectados, sin atarse a implementaciones concretas.
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
   * Actualiza el valor de la celda (rowId, colId) en localStorage
   * y, si hay dbId, lanza actualización en la DB.
   *
   * @param {Array<Object>} currentRows  - Versión actual del estado de filas (tableData).
   * @param {number} localRowIndex       - Índice local (rowId).
   * @param {string} colId               - Nombre/ID de la columna.
   * @param {string} newValue            - Valor nuevo a asignar.
   * @returns {Array<Object>}            - Nuevo array de filas tras la edición.
   */
  async updateCellValue(currentRows, localRowIndex, colId, newValue) {
    // 1) Validaciones rápidas
    if (!Array.isArray(currentRows)) {
      console.warn('CellDataService.updateCellValue: currentRows no es un array.');
      return currentRows;
    }
    if (localRowIndex < 0 || localRowIndex >= currentRows.length) {
      console.warn(`CellDataService.updateCellValue: ÍNDICE inválido = ${localRowIndex}`);
      return currentRows;
    }
    const row = currentRows[localRowIndex];
    const oldValue = row[colId] ?? '';

    // 2) Evitar guardar si no hay cambios o si newValue es vacío
    const safeNewValue = (newValue || '').trim();
    if (!safeNewValue) {
      console.warn(`Valor nuevo vacío/nulo. No se actualiza la celda [${localRowIndex}, ${colId}].`);
      return currentRows;
    }
    if (safeNewValue === String(oldValue).trim()) {
      console.warn(`No hay cambios en la celda [${localRowIndex}, ${colId}].`);
      return currentRows;
    }

    // 3) Clonamos el array y actualizamos
    const updatedRows = [...currentRows];
    updatedRows[localRowIndex] = {
      ...row,
      [colId]: safeNewValue,
    };

    // 4) Guardar localmente
    this.localRepo.saveAllRows(updatedRows);

    // 5) Disparar update remoto si existe dbId en la fila
    const dbId = row.dbId;
    if (dbId !== undefined && dbId !== null) {
      try {
        await this.remoteRepo.updateCell(dbId, colId, safeNewValue);
      } catch (error) {
        console.error('Error actualizando en la DB:', error);
        // Aquí podrías decidir revertir el cambio o mantenerlo.
        // Por defecto, solo registramos el error en consola.
      }
    }

    // 6) Retornar la nueva versión
    return updatedRows;
  }

  /**
   * Carga desde localStorage, pisando la data en memoria si existe algo guardado.
   * @param {Array<Object>} currentRows - Estado inicial proveniente de SSR o padre.
   * @returns {Array<Object>} - El array que se usará en el state.
   */
  loadLocalDataOrDefault(currentRows) {
    const savedRows = this.localRepo.getAllRows();
    if (savedRows && savedRows.length > 0) {
      return savedRows;
    }
    return currentRows;
  }
}
