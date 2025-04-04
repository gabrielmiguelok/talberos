/************************************************************************************
 * Archivo: /repositories/RemoteCellUpdateRepository.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Repositorio que maneja la actualización de datos en la DB vía API HTTP.
 *   - Supone que existe un endpoint real: "/api/rows/updateCell".
 *
 * PRINCIPIOS SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Sólo realiza la operación HTTP para actualizar una celda.
 *   - DIP: Otros servicios/hook lo consumen sin atar su implementación.
 ************************************************************************************/

export class RemoteCellUpdateRepository {
  constructor(apiEndpoint = '/api/rows/updateCell') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Actualiza en la DB el valor de la celda indicada.
   * @param {number|string} dbId  - ID de la fila en la DB.
   * @param {string} colId       - Nombre de la columna (en la DB).
   * @param {string} newValue    - Valor nuevo.
   * @returns {Promise<void>}
   * @throws {Error} si la petición falla.
   */
  async updateCell(dbId, colId, newValue) {
    // Ajusta el body según lo que tu endpoint requiera
    const body = {
      dbId,
      colId,
      newValue,
    };

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar la celda [dbId=${dbId}, colId=${colId}] en la DB`);
    }
  }
}
