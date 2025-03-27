/**
 * Archivo: pages/index.js
 *
 * Página que muestra la tabla con datos de "registrosData.json" y columnas
 * definidas en "FieldsDefinition.js".
 */

import React from 'react';
import CustomTable from '../components/CustomTable';
import dataArray from '../data/registrosData.json';
import fieldsDefinition from '../components/CustomTable/FieldsDefinition';
import { buildColumnsFromDefinition } from '../components/CustomTable/CustomTableColumnsConfig';

export default function RegistrosTest() {
  // Construimos columnas a partir de la definición de campos
  const columns = buildColumnsFromDefinition(fieldsDefinition);

  return (
    <div style={{ padding: 0 }}>
      <CustomTable
        data={dataArray}   // Datos del archivo JSON
        columnsDef={columns}
      />
    </div>
  );
}
