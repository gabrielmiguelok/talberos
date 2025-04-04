/************************************************************************************
 * Archivo: /services/CellEditService.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Servicio para manejar la actualización de celdas, distinguiendo entre:
 *       a) Filas con ID real en DB (dbId), a las que se hace update en MaríaDB.
 *       b) Filas sin ID (solo rowId temporal), que se persisten en localStorage.
 *   - Aplica DIP: recibe un repositorio (CellEditRepository) inyectado por constructor
 *     para realizar las operaciones con la DB.
 *
 * PRINCIPIOS DE DISEÑO:
 * ----------------------------------------------------------------------------------
 *   - SRP: Maneja estrictamente la lógica de "cuándo y cómo" se decide actualizar DB
 *          versus localStorage.
 *   - DIP: No depende de la implementación de repositorio, sino de la abstracción
 *          inyectada (CellEditRepository).
 *   - KISS, DRY, YAGNI: Mantiene funciones claras y sencillas.
 *   - Clean Code: Nombres descriptivos, manejo de errores predecible.
 *
 ************************************************************************************/

export class CellEditService {
  /**
   * @param {Object} options
   * @param {CellEditRepository} options.repository - Implementación del repositorio para DB.
   */
  constructor({ repository }) {
    this.repository = repository;
    // Clave por defecto para localStorage.
    this.localStorageKey = 'myTableData';
  }

  /**
   * updateCell
   * ----------------------------------------------------------------------------------
   * Lógica principal para actualizar una celda (rowData, colId, newValue).
   * Decide si actualizar en DB o solo en localStorage, según si rowData posee `dbId`.
   *
   * @param {Object} rowData  - Objeto que representa la fila completa (incluyendo dbId si existe).
   * @param {string} colId    - El accessorKey / nombre de campo que se está editando.
   * @param {string} newValue - Valor nuevo para la celda.
   * @returns {Promise<void>}
   */
  async updateCell(rowData, colId, newValue) {
    // 1. Validar valor
    const safeNewValue = (newValue ?? '').trim();
    if (!safeNewValue) {
      console.warn(`updateCell: Valor nulo o vacío, no se actualiza la celda [${colId}].`);
      return;
    }

    // 2. Determinar si existe un dbId en la fila
    const hasDbId = rowData?.dbId != null;
    if (!hasDbId) {
      // A) No hay dbId => persistimos en localStorage (puede ser un nuevo draft)
      this.updateLocalStorage(rowData, colId, safeNewValue);
      return;
    }

    // B) Sí hay dbId => hacemos update en la base de datos
    try {
      await this.repository.updateCellInDB(rowData.dbId, colId, safeNewValue);
      // Idealmente, también podríamos reflejar el cambio local para no re-fetch completo:
      this.updateLocalStorage(rowData, colId, safeNewValue);
    } catch (error) {
      console.error('Error actualizando celda en la DB:', error);
      // Podrías re-lanzar el error, manejar fallback, etc.
    }
  }

  /**
   * updateLocalStorage
   * ----------------------------------------------------------------------------------
   * Actualiza la celda de una fila en el array guardado en localStorage,
   * identificando la fila por rowId (o algún campo local).
   *
   * @param {Object} rowData  - Fila completa que incluye rowId y/o dbId.
   * @param {string} colId    - Nombre del campo a actualizar.
   * @param {string} newValue - Valor nuevo.
   */
  updateLocalStorage(rowData, colId, newValue) {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      if (!saved) return;
      const tableData = JSON.parse(saved);

      // Buscar la fila en tableData. 
      // Supongamos que la identificamos por 'rowId' si no hay dbId,
      // o por 'dbId' si existe (para mantener sincronía).
      const index = tableData.findIndex((row) => {
        if (rowData.dbId && row.dbId) {
          return row.dbId === rowData.dbId;
        }
        return row.rowId === rowData.rowId;
      });

      if (index < 0) {
        console.warn(`No se encontró la fila en localStorage para actualizar colId=${colId}.`);
        return;
      }

      // Actualizar el valor
      tableData[index][colId] = newValue;

      // Guardar en localStorage
      localStorage.setItem(this.localStorageKey, JSON.stringify(tableData));
    } catch (error) {
      console.warn('Error actualizando localStorage:', error);
    }
  }
}
