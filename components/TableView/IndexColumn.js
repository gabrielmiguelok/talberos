/**
 * Archivo: /components/registros/TableView/IndexColumn.js
 * LICENSE: MIT
 *
 * Define la columna de índice (número de fila).
 * Puedes escalarlo para agregar más props o metadatos en el futuro.
 */

import { createColumnHelper } from '@tanstack/react-table';

/**
 * getIndexColumn
 * @param {Object} [options] Opciones para personalizar un poco la columna índice.
 * @param {string} [options.headerText='']   - Texto en el encabezado de la columna.
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
