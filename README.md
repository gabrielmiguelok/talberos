# Talberos

**Repositorio**: [github.com/gabrielmiguelok/talberos](https://github.com/gabrielmiguelok/talberos)

Talberos es una **librería de tabla avanzada para React**, diseñada para ofrecer una experiencia tipo Excel dentro de aplicaciones web modernas. Incluye:

- Filtro global y filtros por columna.
- Ordenamiento de columnas (asc/desc).
- Selección de celdas (mouse/touch + teclas con Shift/Ctrl/Cmd).
- Edición en línea de celdas (doble clic).
- Exportación a Excel (XLSX).
- Paginación configurable.
- Modo claro/oscuro.
- Menús contextuales para ocultar columnas/filas o copiar celdas.

## Tabla de Contenidos

1. [Instalación](#instalación)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Uso Básico](#uso-básico)
4. [Características Principales](#características-principales)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Licencia](#licencia)

---

## Instalación

Clona el repositorio y ejecuta la instalación de dependencias. Por ejemplo:

```bash
git clone https://github.com/gabrielmiguelok/talberos.git
cd talberos
npm install
```

Asegúrate de que tu proyecto tenga instalados los paquetes requeridos:
- `react`, `react-dom` (>=18)
- `@tanstack/react-table` (para la lógica de la tabla)
- `xlsx` (para exportar a Excel)
- (Opcional) `@mui/material` y `@mui/icons-material` si deseas la misma experiencia visual y la toolbar con iconos.

El archivo `package.json` de este repositorio contiene referencias similares a:

```json
{
  "name": "next-express-app",
  "version": "1.0.0",
  "description": "Proyecto Next.js sin servidor Express (usando server interno de Next).",
  "scripts": {
    "dev": "cross-env PORT=11000 NODE_OPTIONS=--max-old-space-size=1768 next dev",
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=3768 next build",
    "start": "cross-env NODE_ENV=production PORT=3000 NODE_OPTIONS=--max-old-space-size=1768 next start",
    "lint": "next lint",
    "check-deps": "depcheck",
    "sitemap": "next-sitemap"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/icons-material": "^6.4.8",
    "@mui/material": "^6.4.8",
    "@tanstack/react-table": "^8.20.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5"
    // ... otras dependencias
  },
  "devDependencies": {
    "@next/bundle-analyzer": "latest",
    "cross-env": "^7.0.3"
    // ...
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "license": "MIT"
}
```

---
## Estructura del Proyecto

A continuación, una vista simplificada de cómo se organizan los archivos dentro de **Talberos**:

```
components/
├── CustomTable/
│   ├── CustomTableColumnsConfig.js
│   ├── FieldsDefinition.js
│   └── index.js
├── registros/
│   ├── TableView/
│   │   └── index.js
│   ├── filterFlow.js
│   ├── hooks/
│   │   ├── useCellSelection.js
│   │   ├── useClipboardCopy.js
│   │   ├── useColumnResize.js
│   │   ├── useDebouncedValue.js
│   │   └── useInlineCellEdit.js
│   ├── Pagination.js
│   └── tableViewVisualEffects.js
├── data/
│   └── registrosData.json
├── pages/
│   └── index.js
├── styles/
│   └── globals.css
└── ...

```

- **CustomTable/index.js**: Componente principal que orquesta columnas, paginación, tema, etc.
- **TableView/**: Subcomponente especializado en renderizar la tabla HTML (celdas, cabeceras, menús, selección).
- **hooks/**: Colección de hooks (selección, edición en línea, debounce, redimensionado, etc.).
- **globals.css**: Estilos base y variables CSS (modo oscuro, colores).
- **registrosData.json**: Archivo JSON de ejemplo con datos.
- **pages/index.js**: Ejemplo de página que monta la tabla usando `CustomTable`.

---

## Uso Básico

Para usar el tablero de Talberos con tus datos:

1. **Definir los campos** en un objeto (ej. `FieldsDefinition.js`), indicando `type`, `header`, `width`, etc.
2. **Crear** columnas con `buildColumnsFromDefinition(fieldsDefinition)`.
3. **Proveer** tu arreglo de datos (puede ser un JSON estático o provenir de una API) al prop `data`.
4. **Renderizar** `<CustomTable />` dentro de tu página o componente.

Por ejemplo, en `pages/index.js`:

```jsx
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

```

Este tablero, por defecto, incluye:

- **Ordenamiento** al hacer clic sobre cada encabezado.
- **Selección** de celdas con arrastre o teclas de flecha.
- **Copiado** con `Ctrl + C` (o `Cmd + C`) en las celdas seleccionadas.
- **Edición en línea** haciendo doble clic en una celda (opcional, puede integrarse con tus acciones de guardado).
- **Modo oscuro** que se activa internamente (o lo integras a tu lógica global).
- **Exportación** a Excel si activas la barra de filtros (`showFiltersToolbar`).

---

## Características Principales

1. **Filtro Global y por Columna**

    Cada columna puede tener un operador distinto (`contains`, `range`, `exact`, etc.) según su tipo (`text` o `numeric`). Además, se ofrece un buscador global que filtra en todas las columnas a la vez.

2. **Ordenamiento Avanzado**

    Haciendo clic en el encabezado, la columna alterna `desc`, `asc` y sin orden. También puedes interceptar para reordenar datos manualmente.

3. **Selección de Celdas Estilo Excel**
    - Arrastre con el mouse/touch para seleccionar un rango.
    - Shift + flechas para expandir selección.
    - Ctrl/Cmd + flechas para saltar hasta la siguiente celda vacía/no vacía.
    - Copiar al portapapeles en formato TSV (ideal para pegar en Excel).
4. **Edición en Línea**

    Con doble clic sobre una celda, se habilita un input que al presionar Enter/Escape cierra la edición (puedes conectar esto a tu backend para persistencia).

5. **Modo Oscuro**

    Cambia entre estilo claro y oscuro, añadiendo la clase `.dark-mode` en `<html>`.

6. **Exportación a Excel (XLSX)**

    Filas y columnas visibles (incluyendo filtros aplicados) se exportan en un archivo `.xlsx`.

7. **Paginación**

    Configurable a través de `pageSize`. Se maneja con [@tanstack/react-table](https://tanstack.com/table/v8).

8. **Menú Contextual**

    Clic derecho en un encabezado para ocultar la columna; clic derecho en una fila para ocultar esa fila (requiere callbacks de tu parte para filtrar data/columns).


---
