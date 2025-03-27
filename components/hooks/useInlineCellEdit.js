/************************************************************************************
 * LOCATION: /hooks/useInlineCellEdit.js
 * LICENSE: MIT
 *
 * DESCRIPTION:
 *   Hook para habilitar la edición en línea de una sola celda tras un doble clic.
 *   Maneja el estado de qué celda está en edición, el valor temporal y eventos
 *   de teclado/ratón (Enter, Escape, blur, etc.).
 *
 * USO:
 *   const {
 *     editingCell,
 *     editingValue,
 *     isEditingCell,
 *     handleDoubleClick,
 *     handleChange,
 *     handleKeyDown,
 *     handleBlur
 *   } = useInlineCellEdit();
 *
 *   - "isEditingCell(rowId, colId)" => true/false si esa celda está en edición.
 *   - En tu render de <td>:
 *       onDoubleClick={(evt) => handleDoubleClick(rowId, colId, rawValue)}
 *       if (isEditingCell(rowId, colId)) { render <input> ... } else { render valor normal }
 *
 *   Principios SOLID (SRP): se encarga sólo de la lógica de edición en una celda.
 *
 * @version 1.0
 ************************************************************************************/

import { useState, useCallback } from 'react';

/**
 * useInlineCellEdit
 * Hook para habilitar la edición efímera de una celda mediante doble clic.
 * No altera ni persiste cambios en la data original; si requieres persistir,
 * puedes usar un callback en confirmEdit o integrarlo con tu store.
 *
 * @returns {Object} Métodos y estados para manejar la edición en línea de celdas:
 *   - editingCell: { rowId, colId } | null  => Celda actualmente en edición.
 *   - editingValue: string                  => Valor de texto en edición.
 *   - isEditingCell: (rowId, colId) => boolean
 *   - handleDoubleClick: (rowId, colId, initialVal) => void
 *   - handleChange: (e) => void
 *   - handleKeyDown: (e) => void
 *   - handleBlur: () => void
 */
export default function useInlineCellEdit() {
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  /**
   * Determina si la celda dada (rowId, colId) es la que se está editando
   */
  const isEditingCell = useCallback(
    (rowId, colId) => {
      return editingCell &&
        editingCell.rowId === rowId &&
        editingCell.colId === colId;
    },
    [editingCell]
  );

  /**
   * Inicia la edición en la celda dada con un valor inicial (p.e. el contenido actual)
   */
  const handleDoubleClick = (rowId, colId, initialValue = '') => {
    setEditingCell({ rowId, colId });
    setEditingValue(String(initialValue));
  };

  /**
   * Actualiza el valor conforme escribe el usuario
   */
  const handleChange = (e) => {
    setEditingValue(e.target.value);
  };

  /**
   * Manejo de teclado dentro de la celda en edición
   *  - Enter => confirmamos y salimos
   *  - Escape => cancelamos y salimos
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  /**
   * Se dispara al perder foco la celda (click fuera).
   * Aquí asumimos que confirmamos cambios (o podrías cancelarlos).
   */
  const handleBlur = () => {
    confirmEdit();
  };

  /**
   * Confirma la edición y cierra el modo edición.
   * (Si deseas persistir, podrías integrar con un callback o store)
   */
  const confirmEdit = () => {
    // Aquí podrías persistir editingValue en tu store o invocar onSave
    setEditingCell(null);
    setEditingValue('');
  };

  /**
   * Cancela la edición sin guardar cambios
   */
  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  return {
    editingCell,
    editingValue,
    isEditingCell,
    handleDoubleClick,
    handleChange,
    handleKeyDown,
    handleBlur
  };
}
