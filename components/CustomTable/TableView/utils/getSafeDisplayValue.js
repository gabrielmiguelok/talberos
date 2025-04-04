/************************************************************************************
 * Archivo: /components/TableView/utils/getSafeDisplayValue.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 * Función auxiliar para convertir cualquier valor en una cadena/JSX segura.
 * - Null/Undefined => '' (cadena vacía)
 * - Objeto React (JSX) => se retorna tal cual
 * - Objeto normal => JSON.stringify
 * - Resto => String(...)
 *
 * SRP (Single Responsibility Principle):
 *  - Única función: formatear valores de celda.
 ************************************************************************************/

export default function getSafeDisplayValue(val) {
  if (val == null) return '';
  if (typeof val === 'object') {
    // Caso: elemento React (JSX) o un objeto plain JS
    return val.$$typeof ? val : JSON.stringify(val);
  }
  return String(val);
}
