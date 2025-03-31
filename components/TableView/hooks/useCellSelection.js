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
 * @version 5.6
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
 * @param {object}   containerRef   - useRef del contenedor principal de la tabla.
 * @param {Function} getCellsInfo   - Función que retorna un array de celdas con la forma:
 *                                    [{ id, colField, x, y, width, height }, ...].
 * @param {Array}    data           - Datos originales de la tabla (uso referencial).
 * @param {Array}    columnsDef     - Definición de columnas (uso referencial).
 * @param {object}   table          - Instancia de React Table (@tanstack/react-table).
 * @param {object}   [options]      - Opciones adicionales (parámetros opcionales).
 *   @param {Function} [options.onSelectionChange] - Callback que se llama cuando
 *                                                  la selección de celdas cambia.
 *
 * @returns {object} Un objeto con:
 *  - selectionBox: { x, y, width, height } para representar la selección por arrastre.
 *  - selectedCells: array con celdas seleccionadas ({ id, colField }).
 *  - setSelectedCells: setter expuesto para asignar la selección manualmente.
 *  - anchorCell: { rowIndex, colIndex } indicando la celda “ancla” de la selección.
 *  - focusCell: { rowIndex, colIndex } indicando la celda actualmente en foco.
 *  - setAnchorCell, setFocusCell: setters para ancla y foco.
 *  - handleKeyDownArrowSelection: función para manejar las flechas con Shift/Ctrl,
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
  // ============================================================================
  // [1] ESTADOS PRINCIPALES
  // ============================================================================
  const [selectionBox, setSelectionBox] = useState(null);  // Representa la "caja" de arrastre.
  const [isSelecting, setIsSelecting] = useState(false);    // Flag para saber si estamos arrastrando.

  const [selectedCells, setSelectedCells] = useState([]);   // Array de celdas seleccionadas.
  const [anchorCell, setAnchorCell] = useState(null);       // Celda ancla (para rangos con SHIFT).
  const [focusCell, setFocusCell] = useState(null);         // Celda con "foco" (para navegación teclado).

  // ============================================================================
  // [2] REFS AUXILIARES
  // ============================================================================
  const startPointRef = useRef({ x: 0, y: 0 });  // Almacena la posición (X,Y) donde empezó el arrastre.
  const draggingRef = useRef(false);            // Flag para indicar que efectivamente se está arrastrando.
  const rafIdRef = useRef(null);                // requestAnimationFrame ID (para cancelarlo cuando proceda).

  // ============================================================================
  // [3] DATOS DERIVADOS DE LA TABLA Y CONFIGURACIÓN
  // ============================================================================
  const rows = table?.getRowModel()?.rows || [];                   // Filas actuales (paginadas o filtradas).
  const colCount = table?.getVisibleFlatColumns()?.length || 0;    // Número de columnas visibles.

  // Umbral de “acercamiento” al borde para auto-scroll
  const EDGE_SCROLL_THRESHOLD = 30; // px
  const SCROLL_SPEED = 15;         // px por frame (aprox) al auto-scroll

  // Callback externo para notificar cambios en la selección
  const { onSelectionChange } = options;

  // ============================================================================
  // [4] FUNCIONES DE UTILIDAD COMUNES
  // ============================================================================
  /**
   * isEmpty(value): indica si un valor se considera "vacío" (null, undefined, cadena vacía).
   */
  const isEmpty = (val) => val === null || val === undefined || val === '';

  /**
   * areSelectionsEqual(a, b): compara si dos arrays de celdas son iguales superficialmente.
   * Evita que se llame onSelectionChange sin necesidad.
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
   * rectsIntersect(r1, cellData): verifica si un rectángulo (r1) interseca con la celda (r2),
   * donde r2 se construye a partir del cellData (x, y, width, height).
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
   * getCellValue(rowIndex, colIndex): retorna el valor crudo de la data en [rowIndex, colIndex].
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
   * getCellsInRange(start, end): dados dos puntos de la tabla (rowIndex, colIndex),
   * retorna un array con TODAS las celdas en el rango.
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

  // ============================================================================
  // [5] NAVEGACIÓN CON TECLADO (FLECHAS + SHIFT/CTRL)
  // ============================================================================
  /**
   * findLastCellInDirection(current, direction, ctrlPressed, shiftPressed):
   * emula “saltos” al estilo Excel con Ctrl + flecha.
   * Si la celda de origen está vacía, salta hasta la primera llena (o el borde).
   * Si está llena, salta hasta la primera vacía (o el borde). Si no hay “salto”, avanza 1.
   */
  const findLastCellInDirection = useCallback(
    (current, direction, ctrlPressed, shiftPressed) => {
      if (!ctrlPressed) return current; // Sin CTRL, no hacemos “salto grande”.

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

      // Recorre celda a celda hasta topar con un límite o condición
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
          // Si empezamos en una celda vacía, paramos al encontrar una NO vacía.
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
          // Si empezamos llena, paramos al encontrar una vacía.
          if (cellEmpty) {
            break;
          }
          newRow = nextRow;
          newCol = nextCol;
          foundJump = true;
        }
      }

      // Si no hubo “salto grande”, mover 1 celda normal:
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
      // Si hubo salto y además SHIFT, avanzamos una más (similar a Excel).
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
   * handleKeyDownArrowSelection(e):
   * Maneja flechas + SHIFT/CTRL para moverse y seleccionar celdas estilo Excel.
   * Se sugiere invocar en onKeyDown del contenedor principal.
   */
  const handleKeyDownArrowSelection = useCallback(
    (e) => {
      if (!focusCell) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Si no tenemos ancla y presionan SHIFT, usamos la celda de foco como ancla
      let tempAnchor = anchorCell;
      if (shift && !tempAnchor) {
        tempAnchor = { ...focusCell };
      }

      // Determinamos la nueva celda de foco (1 paso o "salto grande")
      let newFocus = { ...focusCell };
      if (ctrl) {
        newFocus = findLastCellInDirection(newFocus, e.key, true, shift);
      } else {
        // Movimiento “normal” de 1 celda
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

      // Aplicamos el nuevo foco
      setFocusCell(newFocus);

      // Si SHIFT está presionado y tenemos ancla, seleccionamos el rango
      if (shift && tempAnchor) {
        const newCells = getCellsInRange(tempAnchor, newFocus);
        setSelectedCells((prev) => {
          if (!areSelectionsEqual(prev, newCells)) {
            onSelectionChange?.(newCells);
          }
          return newCells;
        });
      } else {
        // Selección de una sola celda
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
        tempAnchor = newFocus; // La celda de foco se convierte en ancla
      }

      setAnchorCell(tempAnchor);

      // Auto-scroll para mantener visible la celda con foco
      if (containerRef.current) {
        const selector = `[data-row="${newFocus.rowIndex}"][data-col="${newFocus.colIndex}"]`;
        const cellEl = containerRef.current.querySelector(selector);
        if (cellEl?.scrollIntoView) {
          cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      e.preventDefault(); // Evitar que la página scrollee con flechas
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

  // ============================================================================
  // [6] ACTUALIZACIÓN DE SELECCIÓN (Wrapper con callback)
  // ============================================================================
  /**
   * updateSelection(newSelected): setea la nueva selección, llamando a onSelectionChange
   * sólo si cambió realmente.
   */
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

  // ============================================================================
  // [7] SELECCIÓN POR CLIC (SIN SHIFT/CTRL)
  // ============================================================================
  /**
   * handleSingleClickSelection(clickedCellPos):
   * Maneja un clic simple sobre una celda para seleccionarla individualmente.
   */
  const handleSingleClickSelection = useCallback(
    (clickedCellPos) => {
      draggingRef.current = true;
      setIsSelecting(true);
      document.body.style.userSelect = 'none'; // Evita selección de texto del navegador

      setAnchorCell(clickedCellPos);
      setFocusCell(clickedCellPos);

      const rowId = rows[clickedCellPos.rowIndex]?.id;
      const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;

      // Si ya está seleccionada, no hacemos nada más
      const alreadySelected = selectedCells.some(
        (c) => c.id === rowId && c.colField === colField
      );
      if (!alreadySelected && rowId != null && colField) {
        updateSelection([{ id: rowId, colField }]);
      }
    },
    [rows, selectedCells, table, updateSelection]
  );

  // ============================================================================
  // [8] AUTO-SCROLL EN BORDES (DURANTE ARRASTRE)
  // ============================================================================
  /**
   * autoScrollIfNeeded(clientX, clientY):
   * si el puntero está cerca del borde del contenedor, desplazamos el scroll.
   */
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

  // ============================================================================
  // [9] EVENTOS DE MOUSE: Detectar clic y arrastre
  // ============================================================================
  /**
   * detectClickedCell(clientX, clientY):
   * Dado un punto (X,Y), buscamos qué celda [rowIndex, colIndex] está debajo.
   */
  const detectClickedCell = useCallback(
    (clientX, clientY) => {
      const container = containerRef.current;
      if (!container) return null;

      const cellElements = container.querySelectorAll('[data-row][data-col]');
      for (const el of cellElements) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
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
   * handleMouseDown(e): inicia la lógica de selección al presionar botón izquierdo.
   */
  const handleMouseDown = useCallback(
    (e) => {
      // Sólo actuar con el botón izquierdo
      if (e.button !== 0) return;

      // Verificar que estamos clickeando dentro del contenedor
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        return;
      }

      startPointRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;

      // Selección individual (sin shift / ctrl / meta)
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
   * handleMouseMoveRaf(e):
   * Lógica principal para actualizar la selección por arrastre con cada frame.
   */
  const handleMouseMoveRaf = useCallback(
    (e) => {
      // Punto inicial
      const { x: startX, y: startY } = startPointRef.current;
      // Punto actual
      const currentX = e.clientX;
      const currentY = e.clientY;

      // Auto-scroll si estamos cerca de los bordes
      autoScrollIfNeeded(currentX, currentY);

      // Calcular las dimensiones del rectángulo de selección
      const distX = Math.abs(currentX - startX);
      const distY = Math.abs(currentY - startY);
      const rectX = Math.min(startX, currentX);
      const rectY = Math.min(startY, currentY);

      const box = { x: rectX, y: rectY, width: distX, height: distY };
      setSelectionBox(box);

      // Determinar qué celdas están dentro del rect
      const allCells = getCellsInfo();
      const selectedDuringDrag = allCells.filter((cell) => rectsIntersect(box, cell));
      updateSelection(selectedDuringDrag);
    },
    [autoScrollIfNeeded, getCellsInfo, rectsIntersect, updateSelection]
  );

  /**
   * handleMouseMove(e):
   * Se invoca en cada movimiento del mouse. Usa requestAnimationFrame para rendimiento.
   */
  const handleMouseMove = useCallback(
    (e) => {
      // Si se suelta el botón (p.e. al salir del contenedor), forzamos a terminar la selección
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
   * handleMouseUp():
   * Al soltar el botón, completamos la selección y limpiamos estados.
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

  // ============================================================================
  // [10] EVENTOS DE TOUCH: (Similares al mouse)
  // ============================================================================
  /**
   * handleTouchStart(e): inicia la selección al tocar la pantalla con un dedo.
   */
  const handleTouchStart = useCallback(
    (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      draggingRef.current = false;

      // Detectar la celda clicada
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

  /**
   * handleTouchMoveRaf(touch): lógica principal para actualizar la selección en cada frame de touch.
   */
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

  /**
   * handleTouchMove(e):
   * Se llama en cada movimiento de dedo (touchmove). Usa requestAnimationFrame para rendimiento.
   */
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length !== 1) return;

      // Si de pronto se retiran los dedos y no se hace "touchend", cancelamos la selección.
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

  /**
   * handleTouchEnd():
   * Al soltar el dedo, finalizamos la selección.
   */
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

  // ============================================================================
  // [11] REGISTRO GLOBAL DE EVENTOS (MOUSE + TOUCH)
  // ============================================================================
  useEffect(() => {
    // Registramos listeners de MOUSE
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    // Registramos listeners de TOUCH
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);

      // Cancelar cualquier frame pendiente
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Restaurar el estilo de selección del body
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

  // ============================================================================
  // [12] MANEJO DE ERRORES Y AUTO-RESET
  // ============================================================================
  /**
   * validateCurrentSelection():
   * Se encarga de validar que las celdas seleccionadas sigan siendo válidas
   * (por ejemplo, cuando cambias de página y los rowIndex/IDs ya no son válidos).
   * Si detecta celdas inválidas, resetea toda la selección.
   *
   * Este comportamiento sirve para “auto-limpiar” la selección si los datos cambian
   * drásticamente y evitas flicker o errores por celdas que ya no existen.
   */
  const validateCurrentSelection = useCallback(() => {
    // Si no hay filas visibles, pero sí hay celdas seleccionadas, reseteamos.
    if (!rows.length && selectedCells.length) {
      console.warn('[useCellSelection] - No hay filas, reseteando selección');
      setSelectedCells([]);
      setAnchorCell(null);
      setFocusCell(null);
      return;
    }

    // Verificar para cada celda si su rowId y colField siguen existiendo
    const rowIdSet = new Set(rows.map((r) => r.id));
    const colIdSet = new Set(table.getVisibleFlatColumns().map((c) => c.id));

    // Filtrar celdas que ya no estén en la tabla
    const invalidCells = selectedCells.filter(
      (cell) => !rowIdSet.has(cell.id) || !colIdSet.has(cell.colField)
    );

    if (invalidCells.length) {
      console.warn(
        '[useCellSelection] - Se detectaron celdas seleccionadas que ya no existen en la página/tabla. Reseteando.'
      );
      setSelectedCells([]);
      setAnchorCell(null);
      setFocusCell(null);
    }
  }, [rows, table, selectedCells]);

  /**
   * useEffect que valida la selección cada vez que cambien:
   * - rows (cambios de página, filtrados, etc.)
   * - table.getVisibleFlatColumns() (cambio en la visibilidad de columnas)
   * - selectedCells (selección actual).
   */
  useEffect(() => {
    validateCurrentSelection();
  }, [rows, table.getVisibleFlatColumns(), selectedCells, validateCurrentSelection]);

  // ============================================================================
  // [13] RETORNO DEL HOOK
  // ============================================================================
  return {
    // Box de selección por arrastre
    selectionBox,

    // Celdas seleccionadas
    selectedCells,
    setSelectedCells, // Setter expuesto para manipular la selección externamente

    // Celdas ancla y foco
    anchorCell,
    focusCell,
    setAnchorCell,
    setFocusCell,

    // Handler para flechas + shift/ctrl
    handleKeyDownArrowSelection,
  };
}
