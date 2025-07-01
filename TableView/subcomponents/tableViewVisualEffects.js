/************************************************************************************
 * LOCATION: /components/components/tableViewVisualEffects.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 *   Módulo dedicado a manejar aspectos de estilos/animaciones/efectos visuales
 *   en celdas de la tabla. Contiene clases y funciones helper para:
 *    - Marcar celdas seleccionadas.
 *    - Marcar celdas copiadas.
 *
 * @constant {string} SELECTED_CELL_CLASS - Clase CSS para celdas seleccionadas.
 * @constant {string} COPIED_CELL_CLASS   - Clase CSS para celdas copiadas.
 * @function applyCopiedEffect - Aplica estilo de "copiado" temporal a un elemento.
 * @function applySelectedEffect - Aplica estilo de "selección" a un elemento.
 * @function removeSelectedEffect - Remueve estilo de "selección" de un elemento.
 ************************************************************************************/

/**
 * Clase CSS usada para indicar que una celda ha sido seleccionada.
 */
export const SELECTED_CELL_CLASS = 'selected-cell-rect';

/**
 * Clase CSS usada para indicar que una celda ha sido copiada recientemente.
 */
export const COPIED_CELL_CLASS = 'copied-cell-rect';

/**
 * Aplica un efecto visual de "copiado" (clase COPIED_CELL_CLASS) a un elemento HTML.
 * Después de `duration` milisegundos, se quita la clase.
 *
 * @param {HTMLElement} element - Elemento HTML de la celda.
 * @param {number} [duration=800] - Tiempo en ms que dura el efecto.
 */
export function applyCopiedEffect(element, duration = 800) {
  if (element) {
    element.classList.add(COPIED_CELL_CLASS);
    setTimeout(() => {
      element.classList.remove(COPIED_CELL_CLASS);
    }, duration);
  }
}

/**
 * Aplica la clase CSS de selección a la celda.
 *
 * @param {HTMLElement} element - Elemento HTML de la celda.
 */
export function applySelectedEffect(element) {
  if (element) {
    element.classList.add(SELECTED_CELL_CLASS);
  }
}

/**
 * Remueve la clase CSS de selección de la celda.
 *
 * @param {HTMLElement} element - Elemento HTML de la celda.
 */
export function removeSelectedEffect(element) {
  if (element) {
    element.classList.remove(SELECTED_CELL_CLASS);
  }
}
