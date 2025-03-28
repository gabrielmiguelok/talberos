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
 *     - SRP (Single Responsibility Principle): El hook se encarga exclusivamente
 *       de la lógica de selección, arrastre y eventos de teclado.
 *     - OCP (Open/Closed Principle): Estructurado para poder agregar más funciones
 *       de selección sin modificar el núcleo.
 *     - LSP (Liskov Substitution Principle): Retorna siempre el mismo tipo de objeto,
 *       por lo que puede sustituirse sin romper el resto de la app.
 *     - ISP (Interface Segregation Principle): Sólo expone los métodos imprescindibles
 *       para su uso (no obliga a usar métodos innecesarios).
 *     - DIP (Dependency Inversion Principle): No depende de implementaciones concretas;
 *       recibe las referencias y funciones clave (containerRef, getCellsInfo, etc.) por
 *       inyección.
 *
 * @version 5.0
 ************************************************************************************/

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCellSelection
 * -----------------------------------------------------------------------------
 * Hook personalizado para gestionar la selección de celdas en una tabla “estilo Excel”,
 * con posibilidad de arrastre (mouse/touch) y navegación por flechas. Implementa:
 *
 *  - Selección por arrastre con el mouse/touch, incluyendo auto-scroll en los bordes.
 *  - Selección con flechas (↑, ↓, ←, →) usando Shift y Ctrl/Cmd.
 *  - Ancla (anchorCell) y foco (focusCell) para selección por rangos.
 *  - Escalabilidad y bajo acoplamiento gracias a la inyección de dependencias:
 *    `containerRef`, `getCellsInfo`, `table`, etc.
 *
 * Parámetros:
 *  @param {object} containerRef  - useRef del contenedor principal de la tabla.
 *  @param {Function} getCellsInfo - Función que retorna un array de celdas con
 *    posición y tamaño: [{ id, colField, x, y, width, height }, ...].
 *  @param {Array} data          - Datos originales de la tabla (no siempre se usa).
 *  @param {Array} columnsDef    - Definición de columnas (no siempre se usa directamente).
 *  @param {object} table        - Instancia de React Table (@tanstack/react-table).
 *
 * Retorna un objeto con:
 *  - selectionBox: info del rectángulo de selección (x, y, width, height).
 *  - selectedCells: array de celdas seleccionadas { id, colField }.
 *  - setSelectedCells: setter para la selección.
 *  - anchorCell: objeto { rowIndex, colIndex } que indica la celda "ancla".
 *  - focusCell: objeto { rowIndex, colIndex } que indica la celda en foco.
 *  - setAnchorCell, setFocusCell: setters correspondientes.
 *  - handleKeyDownArrowSelection: función para manejar flechas + shift/ctrl, se
 *    sugiere llamarla en onKeyDown del contenedor principal.
 *
 * Ejemplo básico de uso:
 * -----------------------------------------------------------------------------
 *  const {
 *    selectedCells,
 *    anchorCell,
 *    focusCell,
 *    handleKeyDownArrowSelection,
 *    ...
 *  } = useCellSelection(
 *       containerRef,
 *       getCellsInfo,
 *       data,
 *       columnsDef,
 *       table
 *     );
 *
 *  <div
 *    ref={containerRef}
 *    tabIndex={0} // imprescindible para recibir eventos de teclado
 *    onKeyDown={handleKeyDownArrowSelection}
 *  >
 *    ... tu render de tabla ...
 *  </div>
 * -----------------------------------------------------------------------------
 */
export default function useCellSelection(
  containerRef,
  getCellsInfo,
  data,
  columnsDef,
  table
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
  const startPointRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  // ----------------------------------------------------------------------------
  // [3] DATOS DERIVADOS
  // ----------------------------------------------------------------------------
  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleFlatColumns().length;

  // Umbral para considerar que el mouse/touch se ha movido lo suficiente como
  // para iniciar el "drag" de selección.
  const DRAG_THRESHOLD = 0;

  // Distancia en px cerca del borde para iniciar el auto-scroll.
  const EDGE_SCROLL_THRESHOLD = 30; // px

  // Velocidad de scroll cuando arrastramos cerca del borde.
  const SCROLL_SPEED = 15; // px por "tick"

  // ----------------------------------------------------------------------------
  // [4] FUNCIONES DE UTILIDAD
  // ----------------------------------------------------------------------------
  /**
   * rectsIntersect
   * Verifica si el rectángulo r1 (x,y,width,height) intersecta con la celda (x,y,width,height).
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

  const isEmpty = (val) => val === null || val === undefined || val === '';

  /**
   * getCellValue
   * Devuelve el valor de la celda en (rowIndex, colIndex) usando la data de React Table.
   */
  const getCellValue = (r, c) =>
    rows[r]?.original?.[table.getVisibleFlatColumns()[c]?.id];

  /**
   * getCellsInRange
   * Dada una celda de inicio y otra de fin (rowIndex,colIndex), retorna todas las celdas
   * que estén en ese rectángulo (rango).
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
   * findLastCellInDirection
   * Emula los “saltos” de Excel cuando se mantiene Ctrl + flecha. Avanza
   * por celdas vacías o no-vacías hasta que cambia la condición.
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

    let dr = 0;
    let dc = 0;
    if (direction === 'ArrowUp') dr = -1;
    if (direction === 'ArrowDown') dr = 1;
    if (direction === 'ArrowLeft') dc = -1;
    if (direction === 'ArrowRight') dc = 1;

    let newRow = rowIndex;
    let newCol = colIndex;
    let moved = false;

    while (true) {
      const nextRow = newRow + dr;
      const nextCol = newCol + dc;
      if (nextRow < 0 || nextRow > maxRow || nextCol < 0 || nextCol > maxCol) {
        break;
      }

      const val = getCellValue(nextRow, nextCol);
      const cellEmpty = isEmpty(val);

      // Si la celda de origen está vacía, paramos al encontrar la primera no vacía.
      // Si no está vacía, paramos al encontrar la primera vacía.
      if (startEmpty) {
        // Avanzamos mientras siga vacío
        if (!cellEmpty) {
          newRow = nextRow;
          newCol = nextCol;
          moved = true;
          break;
        } else {
          newRow = nextRow;
          newCol = nextCol;
          moved = true;
        }
      } else {
        // Origen no vacío: avanzamos mientras no esté vacío
        if (cellEmpty) break;
        newRow = nextRow;
        newCol = nextCol;
        moved = true;
      }
    }

    // Si no hubo “salto” grande, avanzamos 1 casilla
    if (!moved) {
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
    // Si sí hubo salto y hay shift, avanzamos una más
    else if (moved && shiftPressed) {
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
  };

  /**
   * handleKeyDownArrowSelection
   * Método principal para gestionar flechas + shift/ctrl y actualizar la selección.
   * Suele usarse en onKeyDown del contenedor:
   *   <div tabIndex={0} onKeyDown={handleKeyDownArrowSelection}>
   */
  const handleKeyDownArrowSelection = useCallback(
    (e) => {
      if (!focusCell) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      let tempAnchor = anchorCell;
      // Si se presiona Shift y no hay ancla, usamos la celda en foco
      if (shift && !tempAnchor) {
        tempAnchor = { ...focusCell };
      }

      let newFocus = { ...focusCell };

      // Salto Excel con Ctrl
      if (ctrl) {
        newFocus = findLastCellInDirection(newFocus, e.key, true, shift);
      } else {
        // Movimiento normal de 1 celda
        const maxRow = rows.length - 1;
        const maxCol = colCount - 1;

        if (e.key === 'ArrowUp') {
          newFocus.rowIndex = Math.max(0, focusCell.rowIndex - 1);
        } else if (e.key === 'ArrowDown') {
          newFocus.rowIndex = Math.min(maxRow, focusCell.rowIndex + 1);
        } else if (e.key === 'ArrowLeft') {
          newFocus.colIndex = Math.max(0, focusCell.colIndex - 1);
        } else if (e.key === 'ArrowRight') {
          newFocus.colIndex = Math.min(maxCol, focusCell.colIndex + 1);
        }
      }

      // Actualizamos el foco
      setFocusCell(newFocus);

      if (shift && tempAnchor) {
        // Selección de rango con shift
        const newCells = getCellsInRange(tempAnchor, newFocus);
        setSelectedCells(newCells);
      } else {
        // Selección individual
        const rowId = rows[newFocus.rowIndex]?.id;
        const colField = table.getVisibleFlatColumns()[newFocus.colIndex]?.id;
        if (rowId != null && colField) {
          setSelectedCells([{ id: rowId, colField }]);
        }
        tempAnchor = newFocus;
      }

      setAnchorCell(tempAnchor);

      // Auto-scroll a la celda en foco
      if (containerRef.current) {
        const selector = `[data-row="${newFocus.rowIndex}"][data-col="${newFocus.colIndex}"]`;
        const cellEl = containerRef.current.querySelector(selector);
        if (cellEl?.scrollIntoView) {
          cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      // Prevenir scrolling del navegador al usar flechas
      e.preventDefault();
    },
    [
      focusCell,
      anchorCell,
      rows,
      colCount,
      table,
      getCellsInRange,
      containerRef,
      setSelectedCells,
    ]
  );

  // ----------------------------------------------------------------------------
  // [6] MÉTODO AUXILIAR PARA ACTUALIZAR SELECCIÓN
  // ----------------------------------------------------------------------------
  const updateSelection = useCallback((newSelected) => {
    setSelectedCells(newSelected);
  }, []);

  // ----------------------------------------------------------------------------
  // [7] CLIC + ARRASTRE (INICIO DE SELECCIÓN)
  // ----------------------------------------------------------------------------
  /**
   * handleSingleClickSelection
   * Comienza la selección cuando se hace clic en una celda sin shift/ctrl.
   */
  const handleSingleClickSelection = (clickedCellPos) => {
    draggingRef.current = true;
    setIsSelecting(true);
    document.body.style.userSelect = 'none'; // forzamos no seleccionar texto

    // Anclar y enfocar en la celda que se clickeó
    setAnchorCell(clickedCellPos);
    setFocusCell(clickedCellPos);

    const rowId = rows[clickedCellPos.rowIndex]?.id;
    const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;
    // Revisar si ya estaba en selectedCells
    const isAlreadySelected = selectedCells.some(
      (c) => c.id === rowId && c.colField === colField
    );

    // Si no está seleccionada, la seleccionamos
    if (!isAlreadySelected && rowId != null && colField) {
      updateSelection([{ id: rowId, colField }]);
    }
  };

  // ----------------------------------------------------------------------------
  // [8] AUTO-SCROLL EN BORDES
  // ----------------------------------------------------------------------------
  /**
   * autoScrollIfNeeded
   * Si el puntero está cerca de los bordes del contenedor, desplazamos el scroll
   * para que pueda seguir seleccionando.
   */
  const autoScrollIfNeeded = useCallback((mouseX, mouseY) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Borde superior
    if (mouseY - rect.top < EDGE_SCROLL_THRESHOLD) {
      container.scrollTop -= SCROLL_SPEED;
    }
    // Borde inferior
    if (rect.bottom - mouseY < EDGE_SCROLL_THRESHOLD) {
      container.scrollTop += SCROLL_SPEED;
    }
    // Borde izquierdo
    if (mouseX - rect.left < EDGE_SCROLL_THRESHOLD) {
      container.scrollLeft -= SCROLL_SPEED;
    }
    // Borde derecho
    if (rect.right - mouseX < EDGE_SCROLL_THRESHOLD) {
      container.scrollLeft += SCROLL_SPEED;
    }
  }, []);

  // ----------------------------------------------------------------------------
  // [9] EVENTOS DE MOUSE
  // ----------------------------------------------------------------------------
  /**
   * handleMouseDown:
   * Empieza la lógica de selección si se hace mousedown sobre la tabla con botón izq.
   */
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // solo botón izquierdo
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        return;
      }

      startPointRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;

      // Detectar la celda clicada
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

      // Si hay celda y no se usó shift/ctrl, iniciamos selección
      if (clickedCellPos && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        handleSingleClickSelection(clickedCellPos);
      }
    },
    [containerRef, handleSingleClickSelection]
  );

  /**
   * handleMouseMove:
   * Mientras arrastramos, calculamos la caja de selección y auto-scroll si está cerca
   * de los bordes.
   */
  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;

      const { x: sx, y: sy } = startPointRef.current;
      // Si no tenemos un punto de inicio, no hacemos nada
      if (sx === 0 && sy === 0) return;

      const cx = e.clientX;
      const cy = e.clientY;
      const distX = Math.abs(cx - sx);
      const distY = Math.abs(cy - sy);

      // Detectar si empezamos a "arrastrar"
      if (
        (distX > DRAG_THRESHOLD || distY > DRAG_THRESHOLD) &&
        draggingRef.current &&
        !isSelecting
      ) {
        setIsSelecting(true);
        document.body.style.userSelect = 'none';
      }

      if (isSelecting) {
        e.preventDefault();
        // Hacemos auto-scroll si el cursor está cerca del borde
        autoScrollIfNeeded(cx, cy);

        // Definimos el rectángulo de selección
        const x = Math.min(sx, cx);
        const y = Math.min(sy, cy);
        const box = { x, y, width: distX, height: distY };
        setSelectionBox(box);

        // Obtenemos las celdas que caen dentro de ese rect
        const allCells = getCellsInfo();
        const selectedDuringDrag = allCells.filter((cell) =>
          rectsIntersect(box, cell)
        );
        updateSelection(selectedDuringDrag);
      }
    },
    [
      isSelecting,
      autoScrollIfNeeded,
      containerRef,
      getCellsInfo,
      rectsIntersect,
      updateSelection,
    ]
  );

  /**
   * handleMouseUp:
   * Finaliza el arrastre. Si hay selección, se mantiene en el estado.
   */
  const handleMouseUp = useCallback(() => {
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

  // ----------------------------------------------------------------------------
  // [10] EVENTOS DE TOUCH
  // ----------------------------------------------------------------------------
  const handleTouchStart = useCallback(
    (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      draggingRef.current = false;

      // Detectar celda tocada
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

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length !== 1) return;
      if (!draggingRef.current && !isSelecting) return;

      const touch = e.touches[0];
      const sx = startPointRef.current.x;
      const sy = startPointRef.current.y;
      const cx = touch.clientX;
      const cy = touch.clientY;
      const distX = Math.abs(cx - sx);
      const distY = Math.abs(cy - sy);

      if (!isSelecting && (distX > DRAG_THRESHOLD || distY > DRAG_THRESHOLD)) {
        setIsSelecting(true);
        document.body.style.userSelect = 'none';
      }

      if (isSelecting) {
        e.preventDefault();
        // Auto-scroll en touch
        autoScrollIfNeeded(cx, cy);

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
    [
      isSelecting,
      autoScrollIfNeeded,
      getCellsInfo,
      rectsIntersect,
      updateSelection,
    ]
  );

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

  // ----------------------------------------------------------------------------
  // [11] REGISTRO GLOBAL DE EVENTOS
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

    return () => {
      // Limpiar al desmontar
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

  // ----------------------------------------------------------------------------
  // [12] RETORNO
  // ----------------------------------------------------------------------------
  return {
    selectionBox,
    selectedCells,
    setSelectedCells,
    anchorCell,
    focusCell,
    setFocusCell,
    setAnchorCell,
    handleKeyDownArrowSelection,
  };
}
