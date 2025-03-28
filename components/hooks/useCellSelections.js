/************************************************************************************
 * MIT License
 *
 * LOCATION: /components/hooks/useCellSelection.js
 *
 * DESCRIPCIÓN GENERAL:
 *   Hook React para gestionar la selección de celdas en una tabla, con comportamiento
 *   tipo "Excel". Permite:
 *    1. Selección por clic y arrastre con el mouse (o touch).
 *    2. Manejo de teclas de flecha, con soporte para combinaciones (Shift, Ctrl/Cmd)
 *       y salto inteligente (similar a Excel).
 *    3. Selección inmediata al primer clic, sin requerir un segundo "drag click".
 *    4. Integración con react-table (@tanstack/react-table).
 *
 *   Principios aplicados:
 *    - SRP: Se encarga únicamente de la lógica de selección de celdas y sus interacciones
 *      con el teclado y mouse/touch.
 *    - DIP: Recibe `containerRef`, `getCellsInfo`, etc. por props, reduciendo dependencias
 *      directas con otros módulos.
 *
 *   @version 4.2
 *   Cambios en esta versión (mejoras aplicadas):
 *    - Se refina la lógica Ctrl + Flechas para manejar vacíos/no vacíos de forma más clara.
 *    - Se añade una pequeña lógica de "auto-scroll" si se arrastra cerca del borde del contenedor.
 *    - Se unifica y documenta más a detalle cada función interna.
 *    - Se optimiza la detección de celdas en movimiento (no se cambia la firma de la función).
 ************************************************************************************/

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCellSelection
 * Hook que gestiona la selección de celdas estilo Excel, con mouse/touch y teclas de flecha,
 * Shift, Ctrl/Cmd, etc.
 *
 * @param {object} containerRef - Ref del contenedor principal que envuelve la tabla.
 * @param {Function} getCellsInfo - Función que retorna un array de objetos con la info de
 *   cada celda (posición en pantalla y referencias al rowId y colId).
 * @param {Array} data - Array de datos crudos de la tabla (si se requiere para validaciones).
 * @param {Array} columnsDef - Definición de columnas, si se requiere para validaciones.
 * @param {object} table - Instancia de la tabla (@tanstack/react-table), usada para obtener
 *   rows y columnas visibles (rowModel, getVisibleFlatColumns, etc.).
 *
 * @returns {object} - Retorna un objeto con:
 *  - selectionBox: Objeto { x, y, width, height } que define el rectángulo de selección actual.
 *  - selectedCells: Array de celdas seleccionadas ({id, colField}).
 *  - setSelectedCells: Setter para modificar manualmente la selección desde afuera.
 *  - anchorCell: Celda ancla de la selección (rowIndex, colIndex).
 *  - focusCell: Celda en foco (rowIndex, colIndex).
 *  - setFocusCell: Setter para la celda en foco.
 *  - setAnchorCell: Setter para la celda ancla.
 *  - handleKeyDownArrowSelection: Función que maneja la pulsación de flechas + Ctrl/Shift.
 */
export default function useCellSelection(
  containerRef,
  getCellsInfo,
  data,
  columnsDef,
  table
) {
  // ---------------------------------------------------
  // ESTADOS PRINCIPALES
  // ---------------------------------------------------
  /**
   * @property {object|null} selectionBox - Define el rectángulo (x, y, width, height)
   *   creado por el arrastre del mouse/touch.
   */
  const [selectionBox, setSelectionBox] = useState(null);

  /**
   * @property {boolean} isSelecting - Indica si actualmente estamos en medio de un
   *   arrastre para selección múltiple.
   */
  const [isSelecting, setIsSelecting] = useState(false);

  /**
   * @property {Array} selectedCells - Celdas actualmente seleccionadas.
   *   Cada celda se representa como { id: rowId, colField: colId }.
   */
  const [selectedCells, setSelectedCells] = useState([]);

  /**
   * @property {object|null} anchorCell - Celda “ancla” para selección con shift,
   *   representada como { rowIndex, colIndex }.
   */
  const [anchorCell, setAnchorCell] = useState(null);

  /**
   * @property {object|null} focusCell - Celda en “foco” para mover con flechas.
   *   Representada como { rowIndex, colIndex }.
   */
  const [focusCell, setFocusCell] = useState(null);

  // ---------------------------------------------------
  // REFS AUXILIARES
  // ---------------------------------------------------
  /**
   * @property {object} startPointRef - Guarda el punto inicial (x, y) donde se inició el arrastre.
   */
  const startPointRef = useRef({ x: 0, y: 0 });

  /**
   * @property {boolean} draggingRef - Flag para indicar si el usuario inició un drag.
   */
  const draggingRef = useRef(false);

  // ---------------------------------------------------
  // DATOS DERIVADOS
  // ---------------------------------------------------
  const rows = table.getRowModel().rows; // Filas visibles
  const colCount = table.getVisibleFlatColumns().length; // Cant. columnas visibles
  const threshold = 0; // Distancia mínima p/considerar arrastre

  // ---------------------------------------------------
  // FUNCIONES DE AYUDA
  // ---------------------------------------------------

  /**
   * rectsIntersect
   * Valida si el rectángulo r1 colisiona con el rectángulo definido por la celda (cell.x, cell.y, cell.width, cell.height).
   * @param {object} r1 - { x, y, width, height }.
   * @param {object} cell - Objeto con { x, y, width, height } (posición de la celda).
   * @returns {boolean} - true si se intersectan, false en caso contrario.
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
   * isEmpty
   * Determina si un valor es "vacío" (null, undefined o cadena vacía).
   */
  const isEmpty = (val) => val === null || val === undefined || val === '';

  /**
   * getCellValue
   * Devuelve el valor crudo de la celda (rowIndex, colIndex) en la tabla.
   * Se usa para definir saltos con Ctrl + flechas.
   */
  const getCellValue = (r, c) =>
    rows[r]?.original[table.getVisibleFlatColumns()[c]?.id];

  /**
   * getCellsInRange
   * Retorna un array de celdas (objeto { id, colField }) dentro del rectángulo lógico
   * definido por [start, end] (en términos de rowIndex y colIndex).
   *
   * @param {{rowIndex: number, colIndex: number}} start - Celda inicio del rango.
   * @param {{rowIndex: number, colIndex: number}} end - Celda fin del rango.
   * @returns {Array<{id: string, colField: string}>} - Lista de celdas en el rango.
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

  // ---------------------------------------------------
  // LÓGICA DE TECLADO (Flechas, Shift, Ctrl)
  // ---------------------------------------------------

  /**
   * findLastCellInDirection
   * Emula un “salto” al siguiente límite (cambio de vacío/no-vacío) en la dirección de la flecha
   * cuando se mantiene Ctrl (o Cmd). Similar a Excel.
   *
   * @param {{rowIndex: number, colIndex: number}} current - Celda actual de foco.
   * @param {string} direction - Una de: 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'.
   * @param {boolean} ctrlPressed - true si se mantiene Ctrl/Cmd.
   * @param {boolean} shiftPressed - true si se mantiene Shift.
   * @returns {{rowIndex: number, colIndex: number}} - Nueva posición de foco tras el salto.
   */
  const findLastCellInDirection = (
    current,
    direction,
    ctrlPressed,
    shiftPressed
  ) => {
    if (!ctrlPressed) return current;

    let { rowIndex, colIndex } = current;
    const startVal = getCellValue(rowIndex, colIndex);
    const startEmpty = isEmpty(startVal);

    const maxRow = rows.length - 1;
    const maxCol = colCount - 1;

    // Definimos delta de movimiento según la flecha
    let dr = 0;
    let dc = 0;
    if (direction === 'ArrowUp') dr = -1;
    if (direction === 'ArrowDown') dr = 1;
    if (direction === 'ArrowLeft') dc = -1;
    if (direction === 'ArrowRight') dc = 1;

    let newRow = rowIndex;
    let newCol = colIndex;
    let moved = false;

    /**
     *  Avanzamos mientras: 
     *    - Si la celda inicial está "vacía", continuamos mientras sigamos en "vacío" 
     *      hasta encontrar no vacío (o final de la tabla).
     *    - Si la celda inicial NO está "vacía", continuamos mientras no sea "vacío" 
     *      (lo que imita un bloque de celdas con contenido).
     */
    while (true) {
      const nextRow = newRow + dr;
      const nextCol = newCol + dc;
      const outOfBounds =
        nextRow < 0 || nextRow > maxRow || nextCol < 0 || nextCol > maxCol;

      if (outOfBounds) {
        // Fuera de límites, rompemos
        break;
      }
      const val = getCellValue(nextRow, nextCol);
      const cellEmpty = isEmpty(val);

      // Caso "celda inicial vacía": avanzamos mientras
      // sigan vacías, detenemos si encontramos no-vacía
      if (startEmpty) {
        if (!cellEmpty) {
          // Primer no-vacío encontrado
          newRow = nextRow;
          newCol = nextCol;
          moved = true;
          break;
        }
        // Aún vacío, seguimos avanzando
        newRow = nextRow;
        newCol = nextCol;
        moved = true;
      } else {
        // start NO vacío
        if (cellEmpty) {
          // Encontramos vacío, paramos justo antes
          break;
        }
        // Todavía no vacío
        newRow = nextRow;
        newCol = nextCol;
        moved = true;
      }
    }

    // Si no hubo “salto” en el bucle, movemos 1 celda como fallback
    if (!moved) {
      const singleRow = rowIndex + dr;
      const singleCol = colIndex + dc;
      const inBounds =
        singleRow >= 0 &&
        singleRow <= maxRow &&
        singleCol >= 0 &&
        singleCol <= maxCol;
      if (inBounds) {
        newRow = singleRow;
        newCol = singleCol;
      }
    } else if (moved && shiftPressed) {
      // Si Shift está presionado, podemos intentar un "paso extra" opcional
      const extraRow = newRow + dr;
      const extraCol = newCol + dc;
      const inBounds =
        extraRow >= 0 &&
        extraRow <= maxRow &&
        extraCol >= 0 &&
        extraCol <= maxCol;
      if (inBounds) {
        newRow = extraRow;
        newCol = extraCol;
      }
    }

    return { rowIndex: newRow, colIndex: newCol };
  };

  /**
   * handleKeyDownArrowSelection
   * Manejador principal para las flechas + Shift + Ctrl/Cmd, permitiendo
   * mover el foco, extender selección con Shift y saltar bloques con Ctrl.
   *
   * @param {KeyboardEvent} e - Evento de teclado.
   */
  const handleKeyDownArrowSelection = useCallback(
    (e) => {
      if (!focusCell) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Si no hay anchorCell y se usa Shift, anclamos en el foco
      let tempAnchor = anchorCell;
      if (shift && !tempAnchor) {
        tempAnchor = { ...focusCell };
      }

      let newFocus = { ...focusCell };

      // Si se presiona Ctrl, intentamos salto "Excel-like"
      if (ctrl) {
        newFocus = findLastCellInDirection(newFocus, e.key, true, shift);
      } else {
        // Movimiento normal de 1 celda
        const maxRow = rows.length - 1;
        const maxCol = table.getVisibleFlatColumns().length - 1;

        if (e.key === 'ArrowUp') {
          newFocus.rowIndex = Math.max(0, focusCell.rowIndex - 1);
        }
        if (e.key === 'ArrowDown') {
          newFocus.rowIndex = Math.min(maxRow, focusCell.rowIndex + 1);
        }
        if (e.key === 'ArrowLeft') {
          newFocus.colIndex = Math.max(0, focusCell.colIndex - 1);
        }
        if (e.key === 'ArrowRight') {
          newFocus.colIndex = Math.min(maxCol, focusCell.colIndex + 1);
        }
      }

      // Aplicamos el nuevo foco
      setFocusCell(newFocus);

      // Si Shift, seleccionamos el rango. Si no, seleccionamos una sola celda
      if (shift && tempAnchor) {
        const newCells = getCellsInRange(tempAnchor, newFocus);
        setSelectedCells(newCells);
      } else {
        const rowId = rows[newFocus.rowIndex]?.id;
        const colField = table.getVisibleFlatColumns()[newFocus.colIndex]?.id;
        if (rowId != null && colField) {
          setSelectedCells([{ id: rowId, colField }]);
        }
        tempAnchor = newFocus;
      }

      setAnchorCell(tempAnchor);

      // Intentamos scroll automático a la celda enfocada
      if (containerRef.current) {
        const selector = `[data-row="${newFocus.rowIndex}"][data-col="${newFocus.colIndex}"]`;
        const cellEl = containerRef.current.querySelector(selector);
        if (cellEl?.scrollIntoView) {
          cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      e.preventDefault();
    },
    [
      anchorCell,
      focusCell,
      rows,
      table,
      findLastCellInDirection,
      getCellsInRange,
      containerRef,
    ]
  );

  // ---------------------------------------------------
  // ACTUALIZAR SELECCIÓN (función comodín)
  // ---------------------------------------------------
  /**
   * updateSelection
   * Actualiza el array de celdas seleccionadas. 
   *
   * @param {Array<{id:string, colField:string}>} newSelected
   */
  const updateSelection = useCallback((newSelected) => {
    setSelectedCells(newSelected);
  }, []);

  // ---------------------------------------------------
  // CLIC + ARRASTRE: Selección básica con mouse (sin Shift/Ctrl)
  // ---------------------------------------------------
  /**
   * handleSingleClickSelection
   * Maneja el clic simple en una celda (sin shift/ctrl):
   *  - Marca que estamos arrastrando.
   *  - Configura ancla y foco en la misma celda.
   *  - Selecciona la celda si no lo estaba.
   *
   * @param {{rowIndex: number, colIndex: number}} clickedCellPos
   */
  const handleSingleClickSelection = (clickedCellPos) => {
    draggingRef.current = true;
    setIsSelecting(true);
    document.body.style.userSelect = 'none';

    setAnchorCell(clickedCellPos);
    setFocusCell(clickedCellPos);

    const rowId = rows[clickedCellPos.rowIndex]?.id;
    const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;

    // Evitamos re-seleccionar la misma celda si ya está incluida
    const isAlreadySelected = selectedCells.some(
      (c) => c.id === rowId && c.colField === colField
    );
    if (!isAlreadySelected && rowId != null && colField) {
      updateSelection([{ id: rowId, colField }]);
    }
  };

  // ---------------------------------------------------
  // AUTO-SCROLL AL ARRASTRAR
  // ---------------------------------------------------
  /**
   * maybeAutoScroll
   * Intenta hacer scroll en el contenedor (o en el documento) si el mouse/touch
   * se acerca a los bordes. (Mejora con limitaciones para no cambiar la firma).
   *
   * @param {MouseEvent|TouchEvent} e
   */
  const maybeAutoScroll = (e) => {
    if (!containerRef.current) return;

    // Calculamos posición relativa al contenedor
    const containerRect = containerRef.current.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    // TouchEvent
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Si estamos muy cerca del borde inferior, scrolleamos un poco
    const bottomThreshold = containerRect.bottom - 30;
    const topThreshold = containerRect.top + 30;
    const leftThreshold = containerRect.left + 30;
    const rightThreshold = containerRect.right - 30;

    // Movimientos pequeños de scroll, ajustables
    const scrollStep = 20;

    if (clientY > bottomThreshold) {
      containerRef.current.scrollTop += scrollStep;
    } else if (clientY < topThreshold) {
      containerRef.current.scrollTop -= scrollStep;
    }

    if (clientX > rightThreshold) {
      containerRef.current.scrollLeft += scrollStep;
    } else if (clientX < leftThreshold) {
      containerRef.current.scrollLeft -= scrollStep;
    }
  };

  // ---------------------------------------------------
  // EVENTOS DE MOUSE
  // ---------------------------------------------------
  /**
   * handleMouseDown
   * Detecta el clic inicial (botón izquierdo) y, si ocurre dentro de una celda,
   * dispara la lógica de selección individual.
   */
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // Solo click izq
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        return;
      }

      startPointRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;

      // Detectar la celda clickeada
      const cellElements = containerRef.current.querySelectorAll(
        '[data-row][data-col]'
      );
      let clickedCellPos = null;

      cellElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const r = parseInt(el.getAttribute('data-row'), 10);
          const c = parseInt(el.getAttribute('data-col'), 10);
          if (!isNaN(r) && !isNaN(c)) {
            clickedCellPos = { rowIndex: r, colIndex: c };
          }
        }
      });

      // Si efectivamente se ha clickeado una celda y no hay shift/ctrl/meta,
      // manejamos la selección simple
      if (clickedCellPos && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        handleSingleClickSelection(clickedCellPos);
      }
    },
    [containerRef, handleSingleClickSelection]
  );

  /**
   * handleMouseMove
   * Mientras se arrastra, definimos el rectángulo de selección y calculamos qué celdas
   * van quedando incluidas. También invocamos auto-scroll si estamos cerca de los bordes.
   */
  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;

      maybeAutoScroll(e);

      const { x: sx, y: sy } = startPointRef.current;
      if (sx === 0 && sy === 0) return;

      const cx = e.clientX;
      const cy = e.clientY;
      const distX = Math.abs(cx - sx);
      const distY = Math.abs(cy - sy);

      // Activamos la selección si se supera la distancia de threshold
      if ((distX > threshold || distY > threshold) && draggingRef.current && !isSelecting) {
        setIsSelecting(true);
        document.body.style.userSelect = 'none';
      }

      if (isSelecting) {
        e.preventDefault();
        const x = Math.min(sx, cx);
        const y = Math.min(sy, cy);
        const box = { x, y, width: distX, height: distY };
        setSelectionBox(box);

        const allCells = getCellsInfo(); // Info de celdas: pos x/y, width, height, rowId, colField
        const selectedDuringDrag = allCells.filter((cell) => rectsIntersect(box, cell));
        updateSelection(selectedDuringDrag);
      }
    },
    [isSelecting, getCellsInfo, rectsIntersect, updateSelection]
  );

  /**
   * handleMouseUp
   * Finaliza la selección por arrastre. Calcula el conjunto final de celdas
   * y resetea flags de arrastre.
   */
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionBox) {
      const allCells = getCellsInfo();
      const selected = allCells.filter((cell) => rectsIntersect(selectionBox, cell));
      updateSelection(selected);
    }

    setIsSelecting(false);
    draggingRef.current = false;
    startPointRef.current = { x: 0, y: 0 };
    setSelectionBox(null);
    document.body.style.userSelect = '';
  }, [isSelecting, selectionBox, getCellsInfo, rectsIntersect, updateSelection]);

  // ---------------------------------------------------
  // EVENTOS DE TOUCH
  // ---------------------------------------------------
  /**
   * handleTouchStart
   * Similar a handleMouseDown, pero para touch. Inicia un posible arrastre en pantalla táctil.
   */
  const handleTouchStart = useCallback(
    (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      draggingRef.current = false;

      // Detección de la celda tocada
      const cellEls = containerRef.current.querySelectorAll('[data-row][data-col]');
      let clickedCellPos = null;
      cellEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          const r = parseInt(el.getAttribute('data-row'), 10);
          const c = parseInt(el.getAttribute('data-col'), 10);
          if (!isNaN(r) && !isNaN(c)) {
            clickedCellPos = { rowIndex: r, colIndex: c };
          }
        }
      });

      // Iniciamos la selección en la celda tocada
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
    [containerRef, rows, table, updateSelection]
  );

  /**
   * handleTouchMove
   * Análogo a handleMouseMove. Ajusta el rectángulo de selección y scrollea si es necesario.
   */
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length !== 1) return;
      if (!draggingRef.current && !isSelecting) return;

      maybeAutoScroll(e);

      const touch = e.touches[0];
      const sx = startPointRef.current.x;
      const sy = startPointRef.current.y;
      const cx = touch.clientX;
      const cy = touch.clientY;
      const distX = Math.abs(cx - sx);
      const distY = Math.abs(cy - sy);

      if (!isSelecting && (distX > threshold || distY > threshold)) {
        setIsSelecting(true);
        document.body.style.userSelect = 'none';
      }

      if (isSelecting) {
        e.preventDefault();
        const x = Math.min(sx, cx);
        const y = Math.min(sy, cy);
        const newBox = { x, y, width: distX, height: distY };
        setSelectionBox(newBox);

        const allCells = getCellsInfo();
        const selectedDuringDrag = allCells.filter((cell) =>
          rectsIntersect(newBox, cell)
        );
        updateSelection(selectedDuringDrag);
      }
    },
    [isSelecting, getCellsInfo, rectsIntersect, updateSelection]
  );

  /**
   * handleTouchEnd
   * Finaliza la selección táctil, define celdas finales e inicializa variables.
   */
  const handleTouchEnd = useCallback(() => {
    if (isSelecting && selectionBox) {
      const allCells = getCellsInfo();
      const selected = allCells.filter((cell) =>
        rectsIntersect(selectionBox, cell)
      );
      updateSelection(selected);
    }

    setIsSelecting(false);
    draggingRef.current = false;
    startPointRef.current = { x: 0, y: 0 };
    setSelectionBox(null);
    document.body.style.userSelect = '';
  }, [isSelecting, selectionBox, getCellsInfo, rectsIntersect, updateSelection]);

  // ---------------------------------------------------
  // REGISTRAR EVENTOS DE MOUSE/TABLET GLOBALES
  // ---------------------------------------------------
  useEffect(() => {
    // Mouse
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    // Touch
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      // Limpieza
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

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

  // ---------------------------------------------------
  // VALORES DE RETORNO
  // ---------------------------------------------------
  return {
    // El rectángulo de selección en arrastre
    selectionBox,
    // Celdas seleccionadas
    selectedCells,
    setSelectedCells,
    // Celda ancla y foco, para selección con shift y movimiento de flechas
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    // Método para manejo de flechas
    handleKeyDownArrowSelection,
  };
}
