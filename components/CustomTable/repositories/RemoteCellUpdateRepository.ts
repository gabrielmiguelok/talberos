/************************************************************************************
 * Archivo: /repositories/RemoteCellUpdateRepository.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   - Clase que hace la llamada POST a tu backend (Next.js),
 *   - Mandando un body con { id, field, value } para actualizar la DB.
 *
 ************************************************************************************/

export class RemoteCellUpdateRepository {
  /**
   * @param {string} apiEndpoint - Ruta de tu endpoint en Next.js (ej: '/api/user/update')
   */
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * updateCell
   * ----------------------------------------------------------------------------
   * Hace POST con id, field y value al endpoint configurado en el constructor.
   * Retorna true/false según el resultado.
   *
   * @param {number|string} rowId  - ID real en la DB.
   * @param {string}        field  - Nombre de la columna.
   * @param {string}        newValue - Valor a asignar.
   * @returns {Promise<boolean>}
   */
  async updateCell(rowId, field, newValue) {
    try {
      const resp = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rowId,
          field: field,
          value: newValue,
        }),
      });

      if (!resp.ok) {
        console.error(
          `RemoteCellUpdateRepository.updateCell: status=${resp.status}`,
          await resp.text()
        );
        return false;
      }

      const data = await resp.json();
      if (data?.error) {
        console.error('API error:', data.error);
        return false;
      }

      // Éxito
      return true;
    } catch (error) {
      console.error('Excepción en updateCell:', error);
      return false;
    }
  }
}
