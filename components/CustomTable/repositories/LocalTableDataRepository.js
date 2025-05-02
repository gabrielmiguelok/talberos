/************************************************************************************
 * Archivo: /repositories/LocalTableDataRepository.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *  - No persiste nada en localStorage:
 *    - getAllRows siempre devuelve vacío.
 *    - saveAllRows borra la clave si existiera (y en la práctica no guarda nunca nada).
 *
 * PRINCIPIOS APLICADOS:
 *  - KISS: eliminamos complejidad innecesaria.
 *  - YAGNI: no necesitamos persistencia local.
 ************************************************************************************/

export class LocalTableDataRepository {
  constructor(storageKey = 'myTableData') {
    this.storageKey = storageKey;
  }

  /**
   * @returns {Array<Object>}
   * Nunca devuelve nada persistido: siempre array vacío.
   */
  getAllRows() {
    return [];
  }

  /**
   * @param {Array<Object>} rows
   * En lugar de guardar, limpiamos la clave para asegurarnos de que no quede nada.
   */
  saveAllRows(rows) {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Error limpiando localStorage:', error);
    }
  }
}
