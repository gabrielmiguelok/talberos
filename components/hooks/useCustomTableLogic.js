/**
 * Archivo: /components/CustomTable/hooks/useCustomTableLogic.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   Hook principal que encapsula la lógica de orquestación para CustomTable:
 *    - Definición de columnas + columna índice.
 *    - Filtros por columna y global (con debounce).
 *    - Ordenamiento (sorting).
 *    - Creación de la instancia react-table.
 *    - Exportación a Excel.
 *    - Anchos de columnas.
 *
 *   Retorna todos los datos y funciones que la UI (CustomTable) necesita.
 *
 * @version 1.0
 */

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useDebouncedValue } from './useDebouncedValue';
import {
  FilterFlow,
  applySorting,
  getExportColumnsDef,
  getExportValue,
} from './filterFlow';
import getIndexColumn from './IndexColumn';

export function useCustomTableLogic({
  data,
  columnsDef,
  pageSize,
  // Podríamos exponer 'loading' aquí si afectara la lógica,
  // pero por defecto no afecta el cálculo de rows.
}) {
  // 1) Definición final de columnas (se añade la columna índice)
  const columnHelper = createColumnHelper();

  // Evitamos errores si columnsDef no es un array válido
  const finalColumns = useMemo(
    () => (Array.isArray(columnsDef) && columnsDef.length ? columnsDef : []),
    [columnsDef]
  );

  const indexedColumns = useMemo(() => {
    // Columna índice (número de fila)
    const indexColumn = getIndexColumn({
      headerText: '',
      minWidth: 32,
      width: 32,
    });

    // Columnas definidas por el usuario
    const userColumns = finalColumns.map((col) =>
      columnHelper.accessor(col.accessorKey, {
        header: col.header,
        cell: col.cell,
        meta: {
          minWidth: col.minWidth || undefined,
          flex: col.flex || undefined,
          filterMode: col.filterMode || 'contains',
          isNumeric: !!col.isNumeric,
        },
      })
    );

    return [indexColumn, ...userColumns];
  }, [finalColumns, columnHelper]);

  // 2) Filtros por columna
  const [columnFilters, setColumnFilters] = useState({});

  // 3) Filtro global con debounce
  const [tempGlobalFilter, setTempGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(tempGlobalFilter, 500);

  // 4) Ordenamiento
  const [sorting, setSorting] = useState({ columnId: '', direction: '' });
  const toggleSort = (colId) => {
    setSorting((prev) => {
      if (prev.columnId !== colId) return { columnId: colId, direction: 'desc' };
      if (prev.direction === 'desc') return { columnId: colId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId: '', direction: '' };
      return { columnId: colId, direction: 'desc' };
    });
  };

  // Forzar operador 'range' si la columna es numérica y hay min/max
  useEffect(() => {
    Object.keys(columnFilters).forEach((colId) => {
      const colDef = finalColumns.find((c) => c.accessorKey === colId);
      if (colDef?.isNumeric) {
        const cf = columnFilters[colId] || {};
        const { operator, min, max } = cf;
        if ((min != null || max != null) && !operator) {
          setColumnFilters((prev) => ({
            ...prev,
            [colId]: { ...prev[colId], operator: 'range' },
          }));
        }
      }
    });
  }, [columnFilters, finalColumns]);

  // 5) Filtrar + ordenar
  const filteredData = useMemo(() => {
    const flow = new FilterFlow({
      data,
      columnsDef: finalColumns,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
    });
    const step1 = flow._applyColumnFilters([...data]);
    const step2 = flow._applyGlobalFilter(step1);
    const step3 = flow._applyColumnSorting(step2);

    if (sorting.columnId && sorting.direction) {
      return applySorting(step3, sorting, finalColumns);
    }
    return step3;
  }, [data, finalColumns, columnFilters, debouncedGlobalFilter, sorting]);

  // 6) Instancia de la tabla (react-table)
  const table = useReactTable({
    data: filteredData,
    columns: indexedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (_row, rowIndex) => String(rowIndex),
    pageCount: Math.ceil(filteredData.length / pageSize),
    manualPagination: false,
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });

  // 7) Exportar a Excel
  const handleDownloadExcel = () => {
    try {
      const exportCols = getExportColumnsDef(finalColumns);
      const wsData = [
        exportCols.map((c) => c.header),
        ...filteredData.map((row) =>
          exportCols.map((col) => String(getExportValue(row, col)))
        ),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      const wbArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tabla_exportada.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando Excel:', err);
    }
  };

  // 8) Ancho de columnas
  const [columnWidths, setColumnWidths] = useState({});
  const handleSetColumnWidth = (colId, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [colId]: Math.max(50, width),
    }));
  };

  // Retornamos todo lo que el componente final necesita para la UI
  return {
    table,
    columnFilters,
    setColumnFilters,
    tempGlobalFilter,
    setTempGlobalFilter,
    sorting,
    toggleSort,
    handleDownloadExcel,
    columnWidths,
    handleSetColumnWidth,
    finalColumns, // Por si TableSection u otros necesitan la def original
    filteredData, // Útil si se desea conocer cuántas filas resultaron
  };
}
