/************************************************************************************
 * Archivo: /components/TableView/hooks/useInlineCellEdit.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Hook para habilitar la edición en línea de una sola celda tras un doble clic.
 * Maneja el estado de qué celda está en edición, el valor temporal y los eventos
 * de teclado/ratón (Enter, Escape, blur, etc.).
 *
 * NOTA SOBRE PERSISTENCIA (NUEVO):
 * ----------------------------------------------------------------------------------
 *   - Sin alterar su firma pública, este hook lee la función `handleConfirmCellEdit`
 *     desde un contexto (TableEditContext) para poder persistir los cambios en localStorage.
 *
 * USO:
 * ----------------------------------------------------------------------------------
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
 *       onDoubleClick={() => handleDoubleClick(rowId, colId, rawValue)}
 *       if (isEditingCell(rowId, colId)) { render <input> ... } else { render valor normal }
 *
 * PRINCIPIOS SOLID APLICADOS:
 * ----------------------------------------------------------------------------------
 *   - SRP (Single Responsibility Principle):
 *       Se encarga únicamente de la gestión del estado de edición de la celda.
 *   - DIP (Dependency Inversion Principle):
 *       Obtiene la función de confirmación de edición desde un contexto inyectado,
 *       evitando acoplamientos y sin cambiar la interfaz pública.
 *
 * Versión:
 * ----------------------------------------------------------------------------------
 *   - 2.0
 *     - Incorporado acceso a TableEditContext para persistir cambios en localStorage.
 *
 ************************************************************************************/

import { useState, useCallback, useContext } from 'react';
import { TableEditContext } from '../../../CustomTable';

/**
 * useInlineCellEdit
 * Hook para habilitar la edición efímera de una celda mediante doble clic, y ahora
 * (sin alterar su firma) persiste los cambios en localStorage a través de un contexto.
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
  /************************************************************************************
   * [A] LECTURA DEL CONTEXTO PARA CONFIRMAR EDICIÓN
   ************************************************************************************/
  const { handleConfirmCellEdit } = useContext(TableEditContext) || {};

  /************************************************************************************
   * [B] ESTADO LOCAL DEL HOOK
   ************************************************************************************/
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  /**
   * Determina si la celda dada (rowId, colId) es la que se está editando actualmente
   */
  const isEditingCell = useCallback(
    (rowId, colId) => {
      return (
        editingCell &&
        editingCell.rowId === rowId &&
        editingCell.colId === colId
      );
    },
    [editingCell],
  );

  /**
   * Inicia la edición en la celda dada con un valor inicial
   */
  const handleDoubleClick = (rowId, colId, initialValue = '') => {
    setEditingCell({ rowId, colId });
    setEditingValue(String(initialValue));
  };

  /**
   * Actualiza el valor conforme escribe el usuario en el input
   */
  const handleChange = (e) => {
    setEditingValue(e.target.value);
  };

  /**
   * Manejo de teclado dentro de la celda en edición:
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
   * Aquí asumimos que confirmamos cambios por defecto.
   */
  const handleBlur = () => {
    confirmEdit();
  };

  /**
   * Confirma la edición y cierra el modo edición.
   * Si existe la función en el contexto, la invocamos.
   */
  const confirmEdit = () => {
    if (editingCell && handleConfirmCellEdit) {
      handleConfirmCellEdit(editingCell.rowId, editingCell.colId, editingValue);
    }
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
    handleBlur,
  };
}
