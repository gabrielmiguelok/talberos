// =============================================
// ./components/hooks/useClipboardCopy.js
// =============================================
/************************************************************************************
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Hook que maneja la acción de copiar celdas (Ctrl + C / Cmd + C) al portapapeles.
 *   - Copia en formato TSV (tab-separated values).
 *   - Añade efectos visuales a las celdas copiadas (guardadas en copiedCells).
 *
 * @param {Object} containerRef - Referencia al contenedor principal de la tabla.
 * @param {Array} selectedCells - Lista de celdas seleccionadas.
 * @param {Array} data - Conjunto completo de datos (arreglo de objetos).
 * @param {Array} columnsDef - Definición de columnas para mapear colField.
 *
 * @returns {Object} { copiedCells, setCopiedCells }:
 *  - copiedCells: celdas que han sido marcadas como copiadas.
 *  - setCopiedCells: setter para actualizar manualmente la lista de celdas copiadas.
 *
 * USO:
 * const { copiedCells, setCopiedCells } = useClipboardCopy(ref, selectedCells, data, columnsDef);
 ************************************************************************************/

import { useEffect, useState } from 'react';

export default function useClipboardCopy(containerRef, selectedCells, data, columnsDef) {
  const [copiedCells, setCopiedCells] = useState([]);

  useEffect(() => {
    /**
     * handleKeyDown
     *  - Detecta Ctrl + C / Cmd + C para copiar celdas seleccionadas en TSV.
     */
    const handleKeyDown = async (e) => {
      // Ctrl + C o Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedCells.length > 0) {
          try {
            // Mapeamos la data por su 'id' para acceder rápido
            const dataById = new Map(data.map((d) => [d.id, d]));
            const rowsMap = new Map();

            // Agrupamos las celdas por fila
            selectedCells.forEach((cell) => {
              const rowData = dataById.get(cell.id);
              if (!rowData) return;
              const rowArray = rowsMap.get(cell.id) || [];
              rowArray.push(rowData[cell.colField]);
              rowsMap.set(cell.id, rowArray);
            });

            // Convertimos a TSV
            const csvLines = [];
            for (const [_, rowCells] of rowsMap.entries()) {
              csvLines.push(rowCells.join('\t'));
            }
            const csvContent = csvLines.join('\n');

            // Copiamos al portapapeles
            await navigator.clipboard.writeText(csvContent);

            // Actualizamos las celdas copiadas (efecto visual)
            setCopiedCells([...selectedCells]);
          } catch (error) {
            console.error('Error copying to clipboard:', error);
          }
        }
      }
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCells, data, columnsDef, containerRef]);

  return {
    copiedCells,
    setCopiedCells,
  };
}
