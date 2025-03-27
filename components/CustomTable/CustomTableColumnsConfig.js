/**
 * Archivo: /components/CustomTable/CustomTableColumnsConfig.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * Este archivo contiene la lógica de configuración de columnas para un componente de tabla
 * (CustomTable). Incluye funciones utilitarias para:
 *   1. Verificar y normalizar URLs.
 *   2. Renderizar celdas tipo 'link'.
 *   3. Generar la definición de columnas a partir de un objeto de configuración (fieldsDefinition).
 *
 * FUNCIONALIDAD PRINCIPAL:
 * - `buildColumnsFromDefinition(fieldsDefinition)`: Devuelve un array de columnas que la tabla
 *   (CustomTable) usa internamente, tomando como base un objeto de definición (fieldsDefinition).
 *
 * EJEMPLO DE USO:
 * ~~~javascript
 * import { buildColumnsFromDefinition } from './CustomTableColumnsConfig';
 *
 * const fieldsDef = {
 *   nombre: { type: 'text', header: 'Nombre', width: 200 },
 *   edad:   { type: 'numeric', header: 'Edad', width: 80 },
 *   perfil: { type: 'link', header: 'Perfil', width: 150 },
 * };
 *
 * const columns = buildColumnsFromDefinition(fieldsDef);
 * // Ahora 'columns' se puede inyectar en <CustomTable columnsDef={columns} ... />
 * ~~~
 */

import React from 'react';

/**
 * Verifica si una cadena de texto (url) inicia con 'http://' o 'https://'.
 *
 * @function isHttpUrl
 * @param {string} url - La cadena que se desea verificar.
 * @returns {boolean} - Devuelve `true` si la URL inicia con protocolo HTTP/HTTPS, en caso contrario `false`.
 */
function isHttpUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

/**
 * Normaliza una cadena de texto (url) para que comience con 'https://' si
 * no se incluye un protocolo (http o https).
 *
 * @function normalizeUrl
 * @param {string} url - La URL que se desea normalizar.
 * @returns {string} - Devuelve la URL normalizada; si estaba vacía, retorna un string vacío.
 */
function normalizeUrl(url) {
  if (!url) return '';
  return isHttpUrl(url) ? url : `https://${url}`;
}

/**
 * Renderiza una celda de tipo "link" para la tabla.
 * - Si el valor de la celda (info.getValue()) es nulo o vacío, no se renderiza nada.
 * - Si existe un valor, crea un enlace que se abre en una nueva pestaña.
 *
 * @function renderLinkCell
 * @param {object} info - Objeto provisto por la tabla, contiene los métodos para obtener el valor de la celda.
 * @returns {JSX.Element|null} - Enlace anclado (<a>), o `null` si no hay valor.
 */
function renderLinkCell(info) {
  const url = info.getValue();
  if (!url) return null;
  const href = normalizeUrl(url);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      Ver enlace
    </a>
  );
}

/**
 * Crea un array de definición de columnas para la tabla (CustomTable).
 *
 * @function buildColumnsFromDefinition
 * @param {Object} fieldsDefinition - Objeto que describe cada campo (columna), por ejemplo:
 *   {
 *     nombreCampo: {
 *       type: 'link' | 'numeric' | 'text',
 *       header: 'Encabezado de la columna',
 *       width: 100,
 *       // ...otros posibles atributos
 *     }
 *   }
 * @returns {Array} - Array de columnas transformado, listo para ser utilizado en el componente CustomTable.
 *
 * @description
 * Cada propiedad del objeto `fieldsDefinition` corresponde a un campo (columna) en la tabla.
 * La estructura soporta:
 *  - `type`: Puede ser 'link', 'numeric' o 'text'. Controla la manera de mostrar la celda.
 *  - `header`: Texto que se muestra en el encabezado de la columna.
 *  - `width`: Ancho recomendado para la columna en pixeles.
 *
 * Si `type` es 'link', se usará la función `renderLinkCell` para renderizar el contenido
 * como un enlace. Si `type` es 'numeric', se marca la columna como numérica para su estilado.
 * Si no se especifica `type`, la columna se maneja como 'text' (por defecto).
 */
export function buildColumnsFromDefinition(fieldsDefinition) {
  if (!fieldsDefinition || typeof fieldsDefinition !== 'object') {
    return [];
  }

  return Object.keys(fieldsDefinition).map((fieldKey) => {
    const def = fieldsDefinition[fieldKey];
    const type = def.type || 'text'; // Por defecto a 'text'

    let cellRenderer;
    if (type === 'link') {
      cellRenderer = renderLinkCell;
    }

    let isNumeric = false;
    if (type === 'numeric') {
      isNumeric = true;
    }

    return {
      accessorKey: fieldKey,
      header: def.header || fieldKey.toUpperCase(),
      width: def.width || 100,
      isNumeric,
      // Si la columna es 'link', se asigna renderLinkCell; de lo contrario, se muestra un texto plano.
      cell: cellRenderer,
    };
  });
}
