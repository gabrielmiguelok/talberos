/**
 * Archivo: pages/init.js
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *  - **Página de ejemplo** que muestra un componente de tabla (<CustomTable />)
 *    usando datos locales "registrosData.json".
 *  - Demuestra cómo declarar **constantes configurables** (por ejemplo, para alturas, textos,
 *    número de filas por página, etc.) y pasarlas como **props** a <CustomTable/>.
 *
 * PRINCIPIOS SOLID:
 *  - **SRP (Single Responsibility Principle)**:
 *    Este archivo se enfoca únicamente en:
 *      1. Construir la definición de columnas a partir de `fieldsDefinition`.
 *      2. Inyectar a `<CustomTable />` todas las configuraciones necesarias
 *         para personalizar su comportamiento y diseño.
 *    No se preocupa por la lógica de la tabla en sí, que está encapsulada en `<CustomTable />`.
 *
 *  - **DIP (Dependency Inversion Principle)**:
 *    - Este archivo inyecta todas las dependencias (datos, columnas, configuraciones)
 *      a `<CustomTable />`.
 *    - De este modo, `<CustomTable />` no depende de ningún valor o
 *      fuente de datos específica, haciéndolo reutilizable en distintos contextos.
 */

import React from 'react';
import CustomTable from '../components/CustomTable';
import dataArray from '../data/registrosData.json';
import fieldsDefinition from '../components/CustomTable/FieldsDefinition';
import { buildColumnsFromDefinition } from '../components/CustomTable/CustomTableColumnsConfig';

/* -------------------------------------------------------------------------- */
/*         Constantes configurables (para sobrescribir props de CustomTable)  */
/* -------------------------------------------------------------------------- */

/**
 * @constant {string} TABLE_MAX_HEIGHT
 *   Altura máxima (o fija) del contenedor de la tabla, expresada en unidades CSS:
 *   - Podrías usar 700px para diseños fijos.
 *   - Podrías usar "60vh" o "calc(100vh - 100px)" para diseños responsivos.
 */
const TABLE_MAX_HEIGHT = '85vh';

/**
 * @constant {number} TABLE_ROW_HEIGHT
 *   Altura de cada fila de la tabla, en píxeles.
 *   - Ajustar si la tabla requiere más o menos espacio vertical por fila.
 */
const TABLE_ROW_HEIGHT = 20;

/**
 * @constant {string} LOADING_TEXT
 *   Texto que se mostrará si la tabla está en estado de `loading={true}`
 *   (p.ej. cuando se cargan datos asincrónicamente).
 */
const LOADING_TEXT = 'Cargando datos, por favor espera...';

/**
 * @constant {string} NO_RESULTS_TEXT
 *   Texto que se mostrará si no hay filas que representar
 *   (ej. resultados vacíos luego de filtrar).
 */
const NO_RESULTS_TEXT = 'No se han encontrado registros';

/**
 * @constant {number} DEFAULT_PAGE_SIZE
 *   Cantidad de filas que se muestran por página en la tabla.
 */
const DEFAULT_PAGE_SIZE = 50;

/**
 * @constant {string} DEFAULT_THEME_MODE
 *   Modo de color inicial de la tabla:
 *   - "light" (claro)
 *   - "dark" (oscuro)
 */
const DEFAULT_THEME_MODE = 'dark';

/**
 * @constant {number} AUTO_COPY_DELAY
 *   Retardo (en milisegundos) para el auto-copiado de celdas
 *   tras la selección de celdas en la tabla.
 */
const AUTO_COPY_DELAY = 1000;

/**
 * Componente de página de ejemplo que renderiza una tabla con <CustomTable>.
 *
 * @function RegistrosTest
 * @returns {JSX.Element} - Elemento JSX que contiene <CustomTable />.
 *
 * USO:
 *  - Se llama automáticamente cuando se navega a "/init" (dependiendo de cómo
 *    esté configurado tu enrutador en Next.js u otro framework).
 *  - Renderiza un `<div>` conteniendo <CustomTable />,
 *    y provee todos los parámetros necesarios para personalizar la tabla.
 *
 * DETALLES:
 *  1. Se construye la definición de columnas mediante `buildColumnsFromDefinition(fieldsDefinition)`.
 *  2. Se pasa `dataArray` (importado de registrosData.json) como el contenido de la tabla.
 *  3. El resto de props controlan la apariencia (tema, altura, textos)
 *     y el comportamiento (paginación, callbacks).
 */
export default function RegistrosTest() {
  // 1) Construimos las columnas a partir de la definición en "fieldsDefinition.js"
  //    usando la utilidad "buildColumnsFromDefinition".
  const columns = buildColumnsFromDefinition(fieldsDefinition);

  // 2) Renderizamos la página que contiene <CustomTable>
  //    y le pasamos todas las props configurables.
  return (
    <div style={{ padding: 0 }}>
      <CustomTable
        /**
         * Datos del archivo JSON que se mostrarán en la tabla.
         * Cada elemento del array es una fila.
         */
        data={dataArray}

        /**
         * Definición final de columnas, generada dinámicamente
         * por buildColumnsFromDefinition().
         */
        columnsDef={columns}

        /**
         * Modo de tema, si "light" o "dark".
         * Afecta colores base usados en <CustomTable>.
         */
        themeMode={DEFAULT_THEME_MODE}

        /**
         * Cantidad de filas que se mostrará por página (paginación).
         */
        pageSize={DEFAULT_PAGE_SIZE}

        /**
         * Bandera para indicar si la tabla está "cargando"
         * (ej. mientras se obtienen datos).
         * Cambia el estado visual: overlay de "Cargando..."
         */
        loading={false}

        /**
         * Altura máxima para el contenedor de la tabla.
         * Puede ser "730px", "60vh", etc.
         */
        containerHeight={TABLE_MAX_HEIGHT}

        /* ------------------------------------------------------------------
         * Props adicionales para personalización de la tabla.
         * -----------------------------------------------------------------*/

        /**
         * Altura de cada fila (píxeles).
         */
        rowHeight={TABLE_ROW_HEIGHT}

        /**
         * Texto que se mostrará si loading = true.
         */
        loadingText={LOADING_TEXT}

        /**
         * Texto que se mostrará si no hay resultados
         * (cuando rows.length === 0).
         */
        noResultsText={NO_RESULTS_TEXT}

        /**
         * Retraso en milisegundos para auto-copiado
         * de celdas seleccionadas.
         */
        autoCopyDelay={AUTO_COPY_DELAY}

        // -------------------------------------------------------------------
        // Ejemplos de callbacks opcionales que se podrían usar:
        // -------------------------------------------------------------------
        // onRefresh={() => { ... }}
        // showFiltersToolbar={true}
        // onHideColumns={(hiddenCols) => console.log('Ocultando columnas:', hiddenCols)}
        // onHideRows={(hiddenRows) => console.log('Ocultando filas:', hiddenRows)}
      />
    </div>
  );
}
