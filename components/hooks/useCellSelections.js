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
 *    - DIP: Recibe `containerRef`, `getCellsInfo`, etc. por props.
 *    - Se añade control adicional para ignorar columnas "no seleccionables" en la 
 *      selección inicial, equiparando el comportamiento mouse/touch.
 *
 *   @version 4.2
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCellSelection
 * Hook que gestiona la selección de celdas estilo Excel, con mouse/touch y teclas de flecha,
 * Shift, Ctrl/Cmd, etc.
 *
 * @param {object} containerRef  - React ref que apunta al contenedor principal de la tabla.
 * @param {function} getCellsInfo - Función que retorna la info de todas las celdas en formato:
 *                                  [ { x, y, width, height, id, colField }, ... ].
 * @param {Array} data           - Datos de la tabla, para cálculos opcionales.
 * @param {Array} columnsDef     - Definición de columnas (react-table), para cálculos opcionales.
 * @param {object} table         - Instancia de la tabla (react-table), para acceder a métodos
 *                                 como getRowModel(), getVisibleFlatColumns(), etc.
 * @returns {object}             - Objeto con estados y métodos para manejar la selección:
 *                                 {
 *                                   selectionBox,
 *                                   selectedCells,
 *                                   setSelectedCells,
 *                                   anchorCell,
 *                                   focusCell,
 *                                   setFocusCell,
 *                                   setAnchorCell,
 *                                   handleKeyDownArrowSelection
 *                                 }
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
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const [selectedCells, setSelectedCells] = useState([]);
  const [anchorCell, setAnchorCell] = useState(null);
  const [focusCell, setFocusCell] = useState(null);

  // ---------------------------------------------------
  // REFS AUXILIARES
  // ---------------------------------------------------
  const startPointRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  // ---------------------------------------------------
  // DATOS DERIVADOS
  // ---------------------------------------------------
  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleFlatColumns().length;
  const threshold = 0; // Distancia mínima para que se considere arrastre.

  // ---------------------------------------------------
  // HELPER: EVALUAR SI UNA COLUMNA ES "SELECCIONABLE"
  // ---------------------------------------------------
  /**
   * isColumnSelectable
   * - Puedes personalizar esta lógica para omitir columnas por ID, por prop
   *   (p.e. colDef.disableSelection), o porque sea la 'columna índice'.
   *
   *   Retorna true si la columna SÍ debe participar en selección.
   *   Retorna false si queremos “ignorarla”.
   */
  const isColumnSelectable = useCallback((colIndex) => {
    const col = table.getVisibleFlatColumns()[colIndex];
    if (!col) return false;
    // Ejemplo: ignorar col con id 'index' o la primera columna
    if (col.id === 'index' || colIndex === 0) {
      return false;
    }
    return true;
  }, [table]);

  // ---------------------------------------------------
  // FUNCIONES DE AYUDA
  // ---------------------------------------------------
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

  const getCellValue = (r, c) =>
    rows[r]?.original[table.getVisibleFlatColumns()[c]?.id];

  /**
   * getCellsInRange
   *  Retorna un array de celdas [ {id, colField}, ... ] en el rango [start, end].
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
          // Si la columna no es seleccionable, la saltamos:
          if (!isColumnSelectable(c)) continue;

          const colId = table.getVisibleFlatColumns()[c]?.id;
          if (!colId) continue;
          newCells.push({ id: rowId, colField: colId });
        }
      }
      return newCells;
    },
    [rows, table, isColumnSelectable]
  );

  // ---------------------------------------------------
  // LÓGICA DE TECLADO
  // ---------------------------------------------------
  /**
   * findLastCellInDirection
   *  - Emula salto Excel (Ctrl + flechas).
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

    // Avanzamos hasta que cambie la condición (de vacío a no vacío, o viceversa).
    while (true) {
      const nextRow = newRow + dr;
      const nextCol = newCol + dc;
      if (
        nextRow < 0 ||
        nextRow > maxRow ||
        nextCol < 0 ||
        nextCol > maxCol
      ) {
        break;
      }
      const val = getCellValue(nextRow, nextCol);
      const cellEmpty = isEmpty(val);

      if (startEmpty) {
        // Avanzamos mientras siga vacío, o hasta encontrar no vacío
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
        // start NO vacío
        if (cellEmpty) break;
        newRow = nextRow;
        newCol = nextCol;
        moved = true;
      }
    }

    // Si no hubo "salto", avanzar 1 celda
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
    } else if (moved && shiftPressed) {
      // Con shift, damos un paso extra
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
   *  - Lógica principal para flechas con o sin Shift/Ctrl.
   */
  const handleKeyDownArrowSelection = useCallback(
    (e) => {
      if (!focusCell) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Si no hay anchorCell y el usuario presiona Shift, forzamos anclar en la focusCell
      let tempAnchor = anchorCell;
      if (shift && !tempAnchor) {
        tempAnchor = { ...focusCell };
      }

      let newFocus = { ...focusCell };

      // Salto tipo Excel con Ctrl
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

      // Asegurarnos de no forzar foco en columna no seleccionable
      if (!isColumnSelectable(newFocus.colIndex)) {
        e.preventDefault();
        return;
      }

      // Actualizamos el foco
      setFocusCell(newFocus);

      if (shift && tempAnchor) {
        // Selección de rango con Shift
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

      // Guardamos el anchorCell actualizado (si corresponde)
      setAnchorCell(tempAnchor);

      // Scroll automático a la celda enfocada
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
      focusCell,
      anchorCell,
      rows,
      table,
      getCellsInRange,
      containerRef,
      findLastCellInDirection,
      isColumnSelectable,
    ]
  );

  // ---------------------------------------------------
  // ACTUALIZAR SELECCIÓN
  // ---------------------------------------------------
  const updateSelection = useCallback((newSelected) => {
    setSelectedCells(newSelected);
  }, []);

  // ---------------------------------------------------
  // CLIC + ARRASTRE
  // ---------------------------------------------------
  /**
   * handleSingleClickSelection
   * - Lógica que se llama cuando se detecta un clic/touch en una celda
   *   (sin Shift/Ctrl). Realiza la selección individual y setea anchor/focus.
   */
  const handleSingleClickSelection = (clickedCellPos) => {
    draggingRef.current = true;
    setIsSelecting(true);
    document.body.style.userSelect = 'none';

    setAnchorCell(clickedCellPos);
    setFocusCell(clickedCellPos);

    const rowId = rows[clickedCellPos.rowIndex]?.id;
    const colField = table.getVisibleFlatColumns()[clickedCellPos.colIndex]?.id;

    const isAlreadySelected = selectedCells.some(
      (c) => c.id === rowId && c.colField === colField
    );
    if (!isAlreadySelected && rowId != null && colField) {
      updateSelection([{ id: rowId, colField }]);
    }
  };

  // ---------------------------------------------------
  // EVENTOS DE MOUSE
  // ---------------------------------------------------
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // solo click izq
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        return;
      }

      startPointRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;

      // Detectar la celda en la posición del cursor
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

      // Si identificamos una celda "clicada" y no hay teclas especiales,
      // validamos si su columna es seleccionable:
      if (
        clickedCellPos &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        isColumnSelectable(clickedCellPos.colIndex)
      ) {
        handleSingleClickSelection(clickedCellPos);
      }
    },
    [containerRef, isColumnSelectable, handleSingleClickSelection]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;

      const { x: sx, y: sy } = startPointRef.current;
      if (sx === 0 && sy === 0) return;

      const cx = e.clientX;
      const cy = e.clientY;
      const distX = Math.abs(cx - sx);
      const distY = Math.abs(cy - sy);

      // Si ya estamos arrastrando (draggingRef.current) y no se había setIsSelecting,
      // forzamos a "isSelecting" para iniciar el modo selección "caja".
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

        const allCells = getCellsInfo();
        const selectedDuringDrag = allCells.filter((cell) =>
          rectsIntersect(box, cell)
        );
        updateSelection(selectedDuringDrag);
      }
    },
    [isSelecting, getCellsInfo, rectsIntersect, updateSelection]
  );

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

  // ---------------------------------------------------
  // EVENTOS DE TOUCH
  // ---------------------------------------------------
  const handleTouchStart = useCallback(
    (e) => {
      // Sólo si el touch se inicia dentro del contenedor
      if (!containerRef.current?.contains(e.target)) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      draggingRef.current = false;

      // Identificar si el toque inicial cae sobre alguna celda
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

      // Si se identificó una celda y es "seleccionable", iniciamos la selección
      if (clickedCellPos && isColumnSelectable(clickedCellPos.colIndex)) {
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
    [containerRef, isColumnSelectable, rows, table, updateSelection]
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

      // Si ya hay intención de arrastrar y la distancia excede threshold,
      // forzamos modo "selección por caja".
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
  // REGISTRAR EVENTOS
  // ---------------------------------------------------
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
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
  // RETORNO
  // ---------------------------------------------------
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
