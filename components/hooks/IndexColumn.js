/**
 * Archivo: /components/CustomTable/IndexColumn.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   Define la columna de índice (número de fila).
 *   Aquí podrías escalar la lógica para incluir checkboxes, etc.
 *
 * @version 1.0
 */

import { createColumnHelper } from '@tanstack/react-table';

/**
 * getIndexColumn
 * @param {Object} [options] Opciones para personalizar un poco la columna índice.
 * @param {string} [options.headerText='']   - Texto en el encabezado de la columna (por si lo necesitas).
 * @param {number} [options.minWidth=32]     - Ancho mínimo.
 * @param {number} [options.width=32]        - Ancho fijo, si lo deseas.
 *
 * @returns {ColumnDef} Objeto de definición de columna para react-table.
 */
export default function getIndexColumn(options = {}) {
  const { headerText = '', minWidth = 32, width = 32 } = options;

  // Creamos un columnHelper local
  const columnHelper = createColumnHelper();

  // Retornamos la definición
  return columnHelper.display({
    id: '_selectIndex',
    header: headerText,
    cell: (info) => info.row.index + 1, // Mostrar el número de fila
    meta: {
      isSelectIndex: true,
      minWidth,
      width,
    },
  });
}
