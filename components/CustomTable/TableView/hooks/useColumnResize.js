/************************************************************************************
 * LOCATION: /components/registros/hooks/useColumnResize.js
 * DESCRIPTION:
 *   Hook para manejar la lógica de redimensionamiento de columnas.
 *
 * @version 1.0
 ************************************************************************************/
import { useRef } from 'react';

export default function useColumnResize({ columnWidths, setColumnWidth, originalColumnsDef }) {
  // Ref para mantener el estado del redimensionamiento actual.
  const resizeState = useRef({
    isResizing: false,
    startX: 0,
    colId: null,
    startWidth: 0
  });

  /**
   * Inicia el proceso de redimensionamiento cuando se hace mousedown en el handle.
   */
  const handleMouseDownResize = (e, colId) => {
    e.preventDefault();
    e.stopPropagation();
    const initialWidth =
      columnWidths[colId] ||
      (originalColumnsDef.find(c => c.accessorKey === colId)?.width ?? 100);
    resizeState.current = {
      isResizing: true,
      startX: e.clientX,
      colId,
      startWidth: initialWidth
    };
    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
  };

  /**
   * Actualiza el ancho de la columna mientras se mueve el mouse.
   */
  const handleMouseMoveResize = (e) => {
    if (!resizeState.current.isResizing) return;
    const diff = e.clientX - resizeState.current.startX;
    const newWidth = resizeState.current.startWidth + diff;
    setColumnWidth(resizeState.current.colId, newWidth);
  };

  /**
   * Finaliza el proceso de redimensionamiento y elimina los listeners.
   */
  const handleMouseUpResize = () => {
    resizeState.current.isResizing = false;
    document.removeEventListener('mousemove', handleMouseMoveResize);
    document.removeEventListener('mouseup', handleMouseUpResize);
  };

  return { handleMouseDownResize };
}
