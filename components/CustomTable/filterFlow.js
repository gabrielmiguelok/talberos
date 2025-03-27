/************************************************************************************
 * LOCATION: /components/filterFlow.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * Este módulo maneja todo el flujo de filtrado y ordenamiento para los datos de la tabla.
 * Provee la clase FilterFlow y funciones utilitarias:
 *   - FilterFlow: Permite aplicar secuencialmente filtros por columna, filtro global y sorting.
 *   - applySorting: Ordena las filas según la dirección especificada (asc o desc).
 *   - getExportColumnsDef: Permite ajustar o expandir columnas al exportar a Excel.
 *   - getExportValue: Obtiene el valor a exportar de cada celda.
 *
 * @version 3.1
 ************************************************************************************/

export class FilterFlow {
  /**
   * @constructor
   * @param {Object} params - Parámetros para inicializar el flujo de filtrado.
   * @param {Array} params.data - Arreglo de objetos (filas) a filtrar.
   * @param {Array} params.columnsDef - Definición de columnas, para saber cuáles son numéricas, etc.
   * @param {Object} params.columnFilters - Objeto de filtros por columna (ver estructura en CustomTable).
   * @param {string} params.globalFilter - Texto de filtro global.
   */
  constructor({ data, columnsDef, columnFilters, globalFilter }) {
    this.data = data || [];
    this.columnsDef = columnsDef;
    this.columnFilters = columnFilters;
    this.globalFilter = (globalFilter || '').trim().toLowerCase();
  }

  /**
   * Aplica en orden: filtro por columnas, filtro global y ordenamiento.
   * @returns {Array} - Devuelve la lista de filas resultante tras aplicar todos los filtros y ordenamiento.
   */
  applyAll() {
    let rows = [...this.data];
    rows = this._applyColumnFilters(rows);
    rows = this._applyGlobalFilter(rows);
    rows = this._applyColumnSorting(rows);
    return rows;
  }

  /**
   * Aplica los filtros por columna.
   * Verifica para cada columna si existe un filtro (string o numérico).
   *
   * @param {Array} rows - Conjunto de filas a filtrar.
   * @returns {Array} - Filas que cumplen con los criterios de los filtros por columna.
   */
  _applyColumnFilters(rows) {
    if (!rows.length) return rows;

    const hasAnyFilter = Object.keys(this.columnFilters).some((colKey) => {
      const f = this.columnFilters[colKey];
      return (
        f &&
        (f.value ||
          f.min != null ||
          f.max != null ||
          f.exact != null)
      );
    });
    if (!hasAnyFilter) return rows;

    return rows.filter((row) => {
      return this.columnsDef.every((col) => {
        const colKey = col.accessorKey;
        const filter = this.columnFilters[colKey];
        if (!filter) return true;

        const { operator, value, min, max, exact } = filter;
        const cellVal = row[colKey];
        const colIsNum = col.isNumeric;

        if (colIsNum) {
          // Lógica de filtrado numérico
          if (operator === 'range') {
            if (min != null) {
              if (isNaN(cellVal) || Number(cellVal) < min) return false;
            }
            if (max != null) {
              if (isNaN(cellVal) || Number(cellVal) > max) return false;
            }
          } else if (operator === 'exact') {
            if (exact != null) {
              if (Number(cellVal) !== exact) return false;
            }
          }
        } else {
          // Lógica de filtrado para cadenas (string)
          const valStr = String(cellVal || '').toLowerCase();
          const srch = String(value || '').toLowerCase();
          if (!srch) return true; // sin valor => no filtra

          switch (operator) {
            case 'startsWith':
              if (!valStr.startsWith(srch)) return false;
              break;
            case 'endsWith':
              if (!valStr.endsWith(srch)) return false;
              break;
            case 'equals':
              if (valStr !== srch) return false;
              break;
            default:
              // 'contains'
              if (!valStr.includes(srch)) return false;
              break;
          }
        }
        return true;
      });
    });
  }

  /**
   * Aplica un filtro global sobre todas las columnas especificadas en `columnsDef`.
   *
   * @param {Array} rows - Conjunto de filas filtradas hasta el momento.
   * @returns {Array} - Filas que contienen el texto buscado en cualquiera de las columnas.
   */
  _applyGlobalFilter(rows) {
    if (!this.globalFilter) return rows;

    return rows.filter((row) =>
      this.columnsDef.some((col) => {
        const val = row[col.accessorKey];
        return val && String(val).toLowerCase().includes(this.globalFilter);
      })
    );
  }

  /**
   * Aplica el ordenamiento (sortDirection) en la primera columna que lo especifique.
   *
   * @param {Array} rows - Filas filtradas hasta el momento.
   * @returns {Array} - Filas ordenadas, o sin cambios si ninguna columna especifica sortDirection.
   */
  _applyColumnSorting(rows) {
    for (const colKey of Object.keys(this.columnFilters)) {
      const filter = this.columnFilters[colKey];
      if (!filter) continue;

      if (filter.sortDirection === 'asc' || filter.sortDirection === 'desc') {
        const colDef = this.columnsDef.find((c) => c.accessorKey === colKey);
        if (colDef) {
          return applySorting(rows, {
            columnId: colKey,
            direction: filter.sortDirection
          }, this.columnsDef);
        }
      }
    }
    return rows;
  }
}

/**
 * Función para ordenar filas según la columna y dirección.
 * Detecta si la columna es numérica o texto y ordena en consecuencia.
 *
 * @function applySorting
 * @param {Array} rows - Arreglo de filas a ordenar.
 * @param {Object} sorting - Objeto que contiene { columnId, direction }.
 * @param {Array} columnsDef - Definición de columnas, para saber si es numérica (isNumeric).
 * @returns {Array} - Nuevo arreglo de filas ordenadas.
 */
export function applySorting(rows, sorting, columnsDef) {
  const { columnId, direction } = sorting;
  if (!columnId || !direction) return rows;

  const colDef = columnsDef.find((c) => c.accessorKey === columnId);
  const isNumeric = colDef?.isNumeric;

  const sorted = [...rows];
  sorted.sort((a, b) => {
    const valA = a[columnId];
    const valB = b[columnId];

    if (isNumeric) {
      // Orden numérico
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return -1;
      if (isNaN(numB)) return 1;
      return numA - numB;
    } else {
      // Orden alfabético (case-insensitive)
      const strA = valA ? String(valA).toLowerCase() : '';
      const strB = valB ? String(valB).toLowerCase() : '';
      if (strA < strB) return -1;
      if (strA > strB) return 1;
      return 0;
    }
  });

  if (direction === 'desc') {
    sorted.reverse();
  }
  return sorted;
}

/**
 * Retorna la definición de columnas a exportar.
 * Permite “expandir” campos compuestos en múltiples columnas, si se desea.
 *
 * @function getExportColumnsDef
 * @param {Array} columnsDef - Definición original de columnas.
 * @returns {Array} - Nueva definición con columnas ajustadas para exportar.
 */
export function getExportColumnsDef(columnsDef) {
  return columnsDef.reduce((acc, col) => {
    if (col.accessorKey !== 'redes_sociales') {
      acc.push(col);
    } else {
      // Ejemplo de expansión de un campo 'redes_sociales' en varias columnas (WhatsApp, Facebook, etc.)
      acc.push({ accessorKey: 'wp', header: 'WHATSAPP' });
      acc.push({ accessorKey: 'facebook', header: 'FACEBOOK' });
      acc.push({ accessorKey: 'instagram', header: 'INSTAGRAM' });
      acc.push({ accessorKey: 'twitter', header: 'TWITTER' });
      acc.push({ accessorKey: 'tiktok', header: 'TIKTOK' });
      acc.push({ accessorKey: 'youtube', header: 'YOUTUBE' });
      acc.push({ accessorKey: 'linkedin', header: 'LINKEDIN' });
    }
    return acc;
  }, []);
}

/**
 * Obtiene el valor de una celda a exportar.
 *
 * @function getExportValue
 * @param {Object} row - Objeto que representa la fila.
 * @param {Object} col - Objeto que representa la definición de la columna (incluye accessorKey).
 * @returns {string} - Valor seguro (string) para exportación.
 */
export function getExportValue(row, col) {
  return row[col.accessorKey] ?? '';
}
