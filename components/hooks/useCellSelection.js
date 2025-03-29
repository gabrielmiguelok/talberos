/************************************************************************************
 * MIT License
 *
 * LOCATION: /components/hooks/useCellSelection.js
 *
 * DESCRIPCIÓN GENERAL:
 *   Hook React para gestionar la selección de celdas en una tabla, con comportamiento
 *   tipo "Excel". Incluye:
 *     1) Selección por clic y arrastre con mouse o touch (con scroll automático
 *        cuando el puntero se acerca a los bordes).
 *     2) Selección con teclas de flecha (↑, ↓, ←, →), admitiendo Shift y Ctrl/Cmd
 *        para rango y “saltos inteligentes” estilo Excel.
 *     3) Selección inmediata al primer clic sin necesidad de un "segundo" arrastre.
 *     4) Integración con React Table (vía @tanstack/react-table).
 *     5) Control de scroll automático para una UX más fluida (similar a Excel).
 *
 *   Principios SOLID aplicados:
 *     - SRP (Single Responsibility Principle):
 *       El hook se encarga exclusivamente de la lógica de selección, arrastre y
 *       navegación por teclado, sin mezclar otras responsabilidades.
 *
 *     - OCP (Open/Closed Principle):
 *       Está diseñado de forma modular para poder incorporar funcionalidades
 *       adicionales (p.ej., edición de celdas) sin modificar el código base de
 *       selección.
 *
 *     - LSP (Liskov Substitution Principle):
 *       El hook retorna siempre el mismo tipo de objeto, manteniendo una estructura
 *       estable para su uso o reemplazo.
 *
 *     - ISP (Interface Segregation Principle):
 *       Sólo expone las funciones esenciales para el flujo de selección, sin
 *       obligar a utilizar APIs innecesarias.
 *
 *     - DIP (Dependency Inversion Principle):
 *       Las dependencias críticas (Refs, callbacks, instancias de React Table) se
 *       inyectan como parámetros, evitando acoplamientos duros.
 *
 * @version 5.5
 ************************************************************************************/

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCellSelection
 * -----------------------------------------------------------------------------
 * Hook personalizado para gestionar la selección de celdas en una tabla “estilo Excel”,
 * con soporte de arrastre (mouse/touch) y navegación con flechas (incluyendo SHIFT/CTRL).
 * Maneja auto-scroll en bordes e integra con React Table (@tanstack/react-table).
 * Incluye optimizaciones opcionales para grandes volúmenes de datos.
 *
 * Parámetros:
 *  @param {object} containerRef         - useRef del contenedor principal de la tabla.
 *  @param {Function} getCellsInfo       - Función que retorna un array de celdas con:
 *                                         [{ id, colField, x, y, width, height }, ...].
 *  @param {Array} data                  - Datos originales de la tabla (uso referencial).
 *  @param {Array} columnsDef            - Definición de columnas (uso referencial).
 *  @param {object} table                - Instancia de React Table (@tanstack/react-table).
 *  @param {object} [options]            - Opciones adicionales (parámetros opcionales).
 *    @param {Function} [options.onSelectionChange] - Callback invocado cuando
 *                                                   cambia la selección de celdas.
 *
 * Retorna un objeto con:
 *  - selectionBox: { x, y, width, height } representando la selección por arrastre.
 *  - selectedCells: array de celdas seleccionadas ({ id, colField }).
 *  - setSelectedCells: setter para asignar la selección manualmente.
 *  - anchorCell: { rowIndex, colIndex } indicando la celda “ancla” de la selección.
 *  - focusCell: { rowIndex, colIndex } indicando la celda actualmente en foco.
 *  - setAnchorCell, setFocusCell: setters para ancla y foco.
 *  - handleKeyDownArrowSelection: función para manejar flechas con Shift/Ctrl,
 *    sugerida para onKeyDown del contenedor principal.
 */
export default function useCellSelection(
  containerRef,
  getCellsInfo,
  data,
  columnsDef,
  table,
  options = {}
) {
  // ----------------------------------------------------------------------------
  // [1] ESTADOS PRINCIPALES
  // ----------------------------------------------------------------------------
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const [selectedCells, setSelectedCells] = useState([]);
  const [anchorCell, setAnchorCell] = useState(null);
  const [focusCell, setFocusCell] = useState(null);

  // ----------------------------------------------------------------------------
  // [2] REFS AUXILIARES
  // ----------------------------------------------------------------------------
  const startPointRef = useRef({ x: 0, y: 0 }); // Punto inicial de arrastre
  const draggingRef = useRef(false);           // Indica si estamos “arrastrando”
  const rafIdRef = useRef(null);               // requestAnimationFrame ID (para cancelarlo)

  // ----------------------------------------------------------------------------
  // [3] DATOS DERIVADOS DE LA TABLA Y CONFIGURACIÓN
  // ----------------------------------------------------------------------------
  const rows = table?.getRowModel()?.rows || [];
  const colCount = table?.getVisibleFlatColumns()?.length || 0;

  // Umbral de “acercamiento” al borde para auto-scroll
  const EDGE_SCROLL_THRESHOLD = 30; // px
  const SCROLL_SPEED = 15;         // px por ciclo de auto-scroll

  // Callback externo para notificar cambios en la selección
  const { onSelectionChange } = options;

  // ----------------------------------------------------------------------------
  // [4] FUNCIONES DE UTILIDAD
  // ----------------------------------------------------------------------------
  const isEmpty = (val) => val === null || val === undefined || val === '';

  /**
   * Verifica si dos listas de celdas seleccionadas son iguales (superficial).
   * Evita llamadas redundantes a `onSelectionChange`.
   */
  const areSelectionsEqual = (arrA, arrB) => {
    if (arrA.length !== arrB.length) return false;

    const sortedA = [...arrA].sort(
      (a, b) => (a.id + a.colField).localeCompare(b.id + b.colField)
    );
    const sortedB = [...arrB].sort(
      (a, b) => (a.id + a.colField).localeCompare(b.id + b.colField)
    );

    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i].id !== sortedB[i].id || sortedA[i].colField !== sortedB[i].colField) {
        return false;
      }
    }
    return true;
  };

  /**
   * Verifica si el rectángulo r1 intersecta con la celda (considerada como rectángulo r2).
   */
  const rectsIntersect = useCallback((r1, cell) => {
    const r2 = { x: cell.x, y: cell.y, width: cell.width, height: cell.height };
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }, []);

  /**
   * Retorna el valor en la celda [rowIndex, colIndex] usando la data de React Table.
   */
  const getCellValue = useCallback(
    (rowIndex, colIndex) => {
      const rowObj = rows[rowIndex];
      const colObj = table.getVisibleFlatColumns()[colIndex];
      return rowObj?.original?.[colObj?.id];
    },
    [rows, table]
  );

  /**
   * Retorna todas las celdas (id, colField) en el rango [start, end] de filas/columnas.
   */
  const getCellsInRange = useCallback(
    (start, end) => {
      const rowStart = Math.min(start.rowIndex, end.rowIndex);
      const rowEnd = Math.max(start.rowIndex, end.rowIndex);
      const colStart = Math.min(start.colIndex, end.colIndex);
      const colEnd = Math.max(start.colIndex, end.colIndex);

      const newCells = [];
      for (let r = rowStart; r <= rowEnd; r++) {
        const rowId = rows[r]?.id;
        if (rowId == null) continue;

        for (let c = colStart; c <= colEnd; c++) {
          const colId = table.getVisibleFlatColumns()[c]?.id;
          if (!colId) continue;
          newCells.push({ id: rowId, colField: colId });
        }
      }
      return newCells;
    },
    [rows, table]
  );

  // ----------------------------------------------------------------------------
  // [5] LÓGICA TECLADO (FLECHAS, SHIFT, CTRL)
  // ----------------------------------------------------------------------------
  /**
   * Emula “saltos” de Excel con Ctrl + flecha. Si la celda de origen está vacía, salta
   * hasta la primera con contenido (o el borde). Si está llena, salta hasta la primera
   * vacía (o el borde). Si no hay “salto”, avanza 1 celda.
   */
  const findLastCellInDirection = useCallback(
    (current, direction, ctrlPressed, shiftPressed) => {
      if (!ctrlPressed) return current;

      const { rowIndex, colIndex } = current;
      const startVal = getCellValue(rowIndex, colIndex);
      const startEmpty = isEmpty(startVal);

      const maxRow = rows.length - 1;
      const maxCol = colCount - 1;

      let dr = 0;
      let dc = 0;
      if (direction === 'ArrowUp') dr = -1;
      if (direction === 'ArrowDown') dr = 1;
      if (direction === 'ArrowLeft') dc = -1;
      if (direction === 'ArrowRight') dc = 1;

      let newRow = rowIndex;
      let newCol = colIndex;
      let foundJump = false;

      while (true) {
        const nextRow = newRow + dr;
        const nextCol = newCol + dc;

        // Verificar límites
        if (nextRow < 0 || nextRow > maxRow || nextCol < 0 || nextCol > maxCol) {
          break;
        }

        const cellVal = getCellValue(nextRow, nextCol);
        const cellEmpty = isEmpty(cellVal);

        if (startEmpty) {
          // Se detiene al encontrar una que NO esté vacía
          if (!cellEmpty) {
            newRow = nextRow;
            newCol = nextCol;
            foundJump = true;
            break;
          } else {
            newRow = nextRow;
            newCol = nextCol;
            foundJump = true;
          }
        } else {
          // Se detiene al encontrar una vacía
          if (cellEmpty) {
            break;
          }
          newRow = nextRow;
          newCol = nextCol;
          foundJump = true;
        }
      }

      // Si no hubo “salto grande”, avanza 1 celda normal.
      if (!foundJump) {
        const singleRow = rowIndex + dr;
        const singleCol = colIndex + dc;
        if (
          singleRow >= 0 &&
          singleRow <= maxRow &&
          singleCol >= 0 &&
          singleCol <= maxCol
        ) {
          newRow = singleRow;
          newCol = singleCol;
        }
      }
      // Si hubo salto y además SHIFT, intenta avanzar una extra.
      else if (foundJump && shiftPressed) {
        const extraRow = newRow + dr;
        const extraCol = newCol + dc;
        if (
          extraRow >= 0 &&
          extraRow <= maxRow &&
          extraCol >= 0 &&
          extraCol <= maxCol
        ) {
          newRow = extraRow;
          newCol = extraCol;
        }
      }

      return { rowIndex: newRow, colIndex: newCol };
    },
    [colCount, getCellValue, isEmpty, rows]
  );

  /**
   * Maneja flechas + shift/ctrl para moverse y seleccionar celdas estilo Excel.
   * Se sugiere invocar en onKeyDown del contenedor principal.
   */
  const handleKeyDownArrowSelection = useCallback(
    (e) => {
      if (!focusCell) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Creamos ancla si no existía y se presiona SHIFT
      let tempAnchor = anchorCell;
      if (shift && !tempAnchor) {
        tempAnchor = { ...focusCell };
      }

      // Nuevo foco (se moverá 1 celda o un “salto”)
      let newFocus = { ...focusCell };

      // Si hay ctrl/meta, intentar “salto grande”
      if (ctrl) {
        newFocus = findLastCellInDirection(newFocus, e.key, true, shift);
      } else {
        // Movimiento normal de 1 celda
        const maxRow = rows.length - 1;
        const maxCol = colCount - 1;

        if (e.key === 'ArrowUp') {
          newFocus.rowIndex = Math.max(0, newFocus.rowIndex - 1);
        } else if (e.key === 'ArrowDown') {
          newFocus.rowIndex = Math.min(maxRow, newFocus.rowIndex + 1);
        } else if (e.key === 'ArrowLeft') {
          newFocus.colIndex = Math.max(0, newFocus.colIndex - 1);
        } else if (e.key === 'ArrowRight') {
          newFocus.colIndex = Math.min(maxCol, newFocus.colIndex + 1);
        }
      }

      // Actualizamos el foco
      setFocusCell(newFocus);

      if (shift && tempAnchor) {
        // Selección por rango
        const newCells = getCellsInRange(tempAnchor, newFocus);
        setSelectedCells((prev) => {
          if (!areSelectionsEqual(prev, newCells)) {
            onSelectionChange?.(newCells);
          }
          return newCells;
        });
      } else {
        // Selección individual
        const rowId = rows[newFocus.rowIndex]?.id;
        const colField = table.getVisibleFlatColumns()[newFocus.colIndex]?.id;
        if (rowId != null && colField) {
          const singleSelection = [{ id: rowId, colField }];
          setSelectedCells((prev) => {
            if (!areSelectionsEqual(prev, singleSelection)) {
              onSelectionChange?.(singleSelection);
            }
            return singleSelection;
          });
        }
        tempAnchor = newFocus;
      }

      setAnchorCell(tempAnchor);

      // Auto-scroll para mantener la celda de foco visible
      if (containerRef.current) {
        const selector = `[data-row="${newFocus.rowIndex}"][data-col="${newFocus.colIndex}"]`;
        const cellEl = containerRef.current.querySelector(selector);
        if (cellEl?.scrollIntoView) {
          cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      // Evita que la página se desplace con flechas
      e.preventDefault();
    },
    [
      anchorCell,
      colCount,
      containerRef,
      focusCell,
      findLastCellInDirection,
      getCellsInRange,
      onSelectionChange,
      rows,
      table,
    ]
  );

  // ----------------------------------------------------------------------------
  // [6] ACTUALIZACIÓN DE SELECCIÓN (wrapper para notificar por callback)
  // ----------------------------------------------------------------------------
  const updateSelection = useCallback(
    (newSelected) => {
      setSelectedCells((prevSelected) => {
        if (!areSelectionsEqual(prevSelected, newSelected)) {
          onSelectionChange?.(newSelected);
        }
        return newSelected;
      });
    },
    [onSelectionChange]
  );

  // ----------------------------------------------------------------------------
  // [7] CLIC + ARRASTRE (INICIO)
  // ----------------------------------------------------------------------------
  /**
   * Handle para una selección simple por clic (sin shift/ctrl).
   * Ancla y foco van a la celda clicada, y se crea selección individual.
   */
  const handleSingleClickSelection = useCallback(
    (clickedCellPos) => {
      draggingRef.current = true;
      setIsSelecting(true);
      document.body.style.userSelect = 'none'; // Evitar selección de texto nativa

      setAnchorCell(clickedCellPos);
      setFocusCell(clickedCellPos);

      const rowId = rows[clickedCellPos.rowIndex]?.id;
      const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;

      const alreadySelected = selectedCells.some(
        (c) => c.id === rowId && c.colField === colField
      );
      if (!alreadySelected && rowId != null && colField) {
        updateSelection([{ id: rowId, colField }]);
      }
    },
    [rows, selectedCells, table, updateSelection]
  );

  // ----------------------------------------------------------------------------
  // [8] AUTO-SCROLL EN BORDES
  // ----------------------------------------------------------------------------
  const autoScrollIfNeeded = useCallback(
    (clientX, clientY) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const offsetTop = clientY - rect.top;
      const offsetBottom = rect.bottom - clientY;
      const offsetLeft = clientX - rect.left;
      const offsetRight = rect.right - clientX;

      if (offsetTop < EDGE_SCROLL_THRESHOLD) {
        container.scrollTop -= SCROLL_SPEED;
      }
      if (offsetBottom < EDGE_SCROLL_THRESHOLD) {
        container.scrollTop += SCROLL_SPEED;
      }
      if (offsetLeft < EDGE_SCROLL_THRESHOLD) {
        container.scrollLeft -= SCROLL_SPEED;
      }
      if (offsetRight < EDGE_SCROLL_THRESHOLD) {
        container.scrollLeft += SCROLL_SPEED;
      }
    },
    [containerRef]
  );

  // ----------------------------------------------------------------------------
  // [9] EVENTOS DE MOUSE
  // ----------------------------------------------------------------------------
  /**
   * Busca la celda [rowIndex, colIndex] debajo del punto (clientX, clientY).
   * Para tablas grandes, considera usar virtualización en vez de miles de nodos.
   */
  const detectClickedCell = useCallback(
    (clientX, clientY) => {
      const container = containerRef.current;
      if (!container) return null;

      const cellElements = container.querySelectorAll('[data-row][data-col]');
      for (const el of cellElements) {
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          const r = parseInt(el.getAttribute('data-row'), 10);
          const c = parseInt(el.getAttribute('data-col'), 10);
          if (!isNaN(r) && !isNaN(c)) {
            return { rowIndex: r, colIndex: c };
          }
        }
      }
      return null;
    },
    [containerRef]
  );

  /**
   * MouseDown: inicia selección al presionar botón izquierdo dentro del contenedor.
   */
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // Sólo clic izquierdo
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        return;
      }

      startPointRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;

      // Selección simple (sin shift/ctrl/meta)
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const clickedCellPos = detectClickedCell(e.clientX, e.clientY);
        if (clickedCellPos) {
          handleSingleClickSelection(clickedCellPos);
        }
      }
    },
    [containerRef, detectClickedCell, handleSingleClickSelection]
  );

  /**
   * Lógica principal de MouseMove (con requestAnimationFrame para rendimiento).
   */
  const handleMouseMoveRaf = useCallback(
    (e) => {
      const { x: startX, y: startY } = startPointRef.current;
      const currentX = e.clientX;
      const currentY = e.clientY;

      autoScrollIfNeeded(currentX, currentY);

      const distX = Math.abs(currentX - startX);
      const distY = Math.abs(currentY - startY);
      const rectX = Math.min(startX, currentX);
      const rectY = Math.min(startY, currentY);

      const box = { x: rectX, y: rectY, width: distX, height: distY };
      setSelectionBox(box);

      // Determinar celdas intersectadas
      const allCells = getCellsInfo();
      const selectedDuringDrag = allCells.filter((cell) => rectsIntersect(box, cell));
      updateSelection(selectedDuringDrag);
    },
    [autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection]
  );

  /**
   * MouseMove real: dispara el handle con requestAnimationFrame sólo si estamos arrastrando.
   */
  const handleMouseMove = useCallback(
    (e) => {
      // Si se soltó el botón (por ejemplo, saliendo del contenedor), terminar selección
      if (isSelecting && e.buttons !== 1) {
        draggingRef.current = false;
        setIsSelecting(false);
        setSelectionBox(null);
        document.body.style.userSelect = '';
        return;
      }
      if (!isSelecting || !draggingRef.current) return;

      e.preventDefault();

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => handleMouseMoveRaf(e));
    },
    [handleMouseMoveRaf, isSelecting]
  );

  /**
   * MouseUp: finaliza selección por arrastre y limpia estados.
   */
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionBox) {
      const allCells = getCellsInfo();
      const finalSelected = allCells.filter((cell) => rectsIntersect(selectionBox, cell));
      updateSelection(finalSelected);
    }
    setIsSelecting(false);
    draggingRef.current = false;
    startPointRef.current = { x: 0, y: 0 };
    setSelectionBox(null);
    document.body.style.userSelect = '';
  }, [isSelecting, selectionBox, getCellsInfo, rectsIntersect, updateSelection]);

  // ----------------------------------------------------------------------------
  // [10] EVENTOS DE TOUCH (LÓGICA SIMILAR A MOUSE)
  // ----------------------------------------------------------------------------
  const handleTouchStart = useCallback(
    (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      draggingRef.current = false;

      const clickedCellPos = detectClickedCell(touch.clientX, touch.clientY);
      if (clickedCellPos) {
        draggingRef.current = true;
        setIsSelecting(true);
        document.body.style.userSelect = 'none';

        setAnchorCell(clickedCellPos);
        setFocusCell(clickedCellPos);

        const rowId = rows[clickedCellPos.rowIndex]?.id;
        const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;
        if (rowId != null && colField) {
          updateSelection([{ id: rowId, colField }]);
        }
      }
    },
    [containerRef, detectClickedCell, rows, table, updateSelection]
  );

  const handleTouchMoveRaf = useCallback(
    (touch) => {
      const { x: startX, y: startY } = startPointRef.current;
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      autoScrollIfNeeded(currentX, currentY);

      const distX = Math.abs(currentX - startX);
      const distY = Math.abs(currentY - startY);
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);

      const newBox = { x, y, width: distX, height: distY };
      setSelectionBox(newBox);

      const allCells = getCellsInfo();
      const selectedDuringDrag = allCells.filter((cell) => rectsIntersect(newBox, cell));
      updateSelection(selectedDuringDrag);
    },
    [autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length !== 1) return;
      if (isSelecting && !draggingRef.current) {
        setIsSelecting(false);
        setSelectionBox(null);
        document.body.style.userSelect = '';
        return;
      }
      if (!isSelecting || !draggingRef.current) return;

      e.preventDefault();

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => handleTouchMoveRaf(e.touches[0]));
    },
    [handleTouchMoveRaf, isSelecting]
  );

  const handleTouchEnd = useCallback(() => {
    if (isSelecting && selectionBox) {
      const allCells = getCellsInfo();
      const finalSelected = allCells.filter((cell) => rectsIntersect(selectionBox, cell));
      updateSelection(finalSelected);
    }
    setIsSelecting(false);
    draggingRef.current = false;
    startPointRef.current = { x: 0, y: 0 };
    setSelectionBox(null);
    document.body.style.userSelect = '';
  }, [isSelecting, selectionBox, getCellsInfo, rectsIntersect, updateSelection]);

  // ----------------------------------------------------------------------------
  // [11] REGISTRO GLOBAL DE EVENTOS (MOUSE + TOUCH)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    // MOUSE
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    // TOUCH
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      // Remover listeners
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);

      // Cancelar RAF pendiente
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Restaurar estilo de selección
      document.body.style.userSelect = '';
    };
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // ----------------------------------------------------------------------------
  // [12] RETORNO DEL HOOK
  // ----------------------------------------------------------------------------
  return {
    selectionBox,
    selectedCells,
    setSelectedCells, // Setter expuesto para manipular la selección externamente
    anchorCell,
    focusCell,
    setAnchorCell,
    setFocusCell,
    handleKeyDownArrowSelection,
  };
}
