/**
 * Archivo: /components/CustomTable/FieldsDefinition.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN GENERAL:
 * Este archivo exporta un objeto `fieldsDefinition` que describe la configuración
 * de cada campo (columna) para un ejemplo de tabla.
 *
 * ESTRUCTURA:
 * {
 *   nombreCampo: {
 *     type: 'text' | 'numeric' | 'link', // (u otros tipos soportados)
 *     header: 'Texto en el encabezado',
 *     width: 100, // Ancho en pixeles
 *   },
 *   ...
 * }
 *
 * USO:
 * Normalmente este objeto se importa y se pasa como parámetro a la función
 * `buildColumnsFromDefinition(fieldsDefinition)`, o directamente al prop `columnsDef`
 * de `<CustomTable />`.
 */

interface FieldDefinition {
  type: 'text' | 'numeric' | 'link';
  header: string;
  width: number;
}

interface FieldsDefinition {
  [key: string]: FieldDefinition;
}

/**
 * @constant {FieldsDefinition} fieldsDefinition
 * @property {FieldDefinition} nombre
 * @property {FieldDefinition} telefono
 * @property {FieldDefinition} ciudad
 * @property {FieldDefinition} pais
 * @property {FieldDefinition} edad
 * @property {FieldDefinition} likes
 * @property {FieldDefinition} maps_url
 *
 * Cada subobjeto define:
 *  - type: Determina cómo se interpreta la celda ('text', 'numeric', 'link').
 *  - header: Texto que se muestra como encabezado de la columna.
 *  - width: Ancho preferido (en pixeles).
 *  - [opcional] Otros atributos personalizados según necesidad.
 */
const fieldsDefinition: FieldsDefinition = {
  nombre: {
    type: 'text',
    header: 'NOMBRE COMPLETO',
    width: 180,
  },
  telefono: {
    type: 'text',
    header: 'TELÉFONO',
    width: 120,
  },
  ciudad: {
    type: 'text',
    header: 'CIUDAD',
    width: 100,
  },
  pais: {
    type: 'text',
    header: 'PAÍS',
    width: 100,
  },
  edad: {
    type: 'numeric',
    header: 'EDAD',
    width: 80,
  },
  likes: {
    type: 'numeric',
    header: 'LIKES',
    width: 80,
  },
  maps_url: {
    type: 'link',
    header: 'UBICACIÓN (Maps)',
    width: 200,
  },
  // Agrega más campos si lo requieres:
  // ejemploCampo: {
  //   type: 'text',
  //   header: 'EJEMPLO',
  //   width: 150,
  // },
};

export default fieldsDefinition;
