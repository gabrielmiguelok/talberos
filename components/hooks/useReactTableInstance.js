/************************************************************************************
 * LOCATION: /components/useReactTableInstance.js
 * LICENSE: MIT
 *
 * DESCRIPTION:
 *   Hook que crea la instancia de React Table y añade una columna especial "_selectIndex"
 *   para la selección de filas/tablas (header vacío).
 *
 *   Funcionalidades:
 *   - Genera un ID numérico para cada fila (getRowId).
 *   - Añade la columna "_selectIndex" con header vacío:
 *       * Clic en header => Seleccionar toda la tabla.
 *       * Clic en la celda => Seleccionar la fila completa.
 *   - Ajusta la anchura mínima y aplica meta para estilo (fondo oscuro si fuera el caso).
 *
 *   Principios:
 *   - SRP: Solo configura la instancia de React Table.
 *   - DIP y OCP: Inyección de dependencias y fácil extensión sin modificar el resto.
 *
 * @version 4.0
 ************************************************************************************/

import { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';

export default function useReactTableInstance(data, columnsDef, pageSize) {
  const columnHelper = createColumnHelper();

  /**
   * Columna interna para mostrar el índice de cada fila (1-based),
   * simulando la columna de Excel:
   *   - Sin título en el header.
   *   - Más angosta (32px).
   *   - Fondo algo más oscuro en header y celdas (si lo deseas).
   */
  const indexedColumnsDef = useMemo(() => {
    // Columna para índice
    const selectIndexColumn = columnHelper.display({
      id: '_selectIndex',
      header: '', // Header vacío
      cell: (info) => info.row.index + 1, // Muestra índice 1-based
      meta: {
        isSelectIndex: true,
        // Ancho más angosto
        minWidth: 32,
        width: 32
      }
    });

    // Mapeamos tus columnas originales
    const userColumns = columnsDef.map((col) =>
      columnHelper.accessor(col.accessorKey, {
        header: col.header,
        cell: col.cell,
        meta: {
          minWidth: col.minWidth,
          flex: col.flex,
          filterMode: col.filterMode || 'contains'
        }
      })
    );

    // Retornamos la columna especial + las definidas por el usuario
    return [selectIndexColumn, ...userColumns];
  }, [columnsDef, columnHelper]);

  // Creamos la instancia de la tabla
  const table = useReactTable({
    data,
    columns: indexedColumnsDef,

    // ID interno: rowIndex
    getRowId: (_row, rowIndex) => rowIndex,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(data.length / pageSize),
    manualPagination: false,
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0
      }
    }
  });

  return table;
}
