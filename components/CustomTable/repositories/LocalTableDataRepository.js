/************************************************************************************
 * Archivo: /repositories/LocalTableDataRepository.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Repositorio responsable de la persistencia local (localStorage).
 *   - Lee y escribe el array de filas completas en la clave "myTableData".
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Maneja sólo la lógica de I/O con localStorage.
 *   - DIP: Otros servicios/hook se apoyan en este repositorio sin depender de detalles internos.
 ************************************************************************************/

export class LocalTableDataRepository {
  constructor(storageKey = 'myTableData') {
    this.storageKey = storageKey;
  }

  /**
   * Obtiene el array completo de filas desde localStorage.
   * Si no existe, retorna un array vacío.
   * @returns {Array<Object>}
   */
  getAllRows() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.warn('Error leyendo datos de localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda el array completo de filas en localStorage.
   * @param {Array<Object>} rows
   */
  saveAllRows(rows) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(rows));
    } catch (error) {
      console.warn('Error guardando en localStorage:', error);
    }
  }
}

