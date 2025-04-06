"use client";

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/FloatingChatIcon.js
 *
 * DESCRIPCIÓN:
 *   - Ícono flotante (lado derecho) que activa el chat al hacer clic y se puede arrastrar.
 *   - Cuando se arrastra, aparece una crucecita gris abajo al centro; si se
 *     suelta cerca de ella, se oculta el ícono.
 *   - Usa use-gesture y react-spring para la animación y el drag.
 *   - Cuando el modal (chat) se abre, se oculta el ícono; al cerrar el modal,
 *     se muestra de nuevo (basado en un evento global).
 *
 * PRINCIPIOS SOLID:
 *   - SRP (Single Responsibility Principle):
 *       * Solo se encarga de mostrar y arrastrar el ícono flotante y
 *         escuchar un evento global para volver a mostrarse.
 *   - DIP (Dependency Inversion Principle):
 *       * Expone onClick para que la lógica externa abra el chat.
 *       * No se acopla directamente a cómo se cierra el modal,
 *         solo escucha un evento global para reaparecer.
 *
 * -----------------------------------------------------------------------------
 */

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE CONFIGURACIÓN
   -------------------------------------------------------------------------- */

/**
 * Tamaño total del contenedor del ícono flotante.
 */
const CONTAINER_WIDTH = 100;
const CONTAINER_HEIGHT = 100;

/**
 * Tamaño real del ícono dentro del contenedor.
 */
const ICON_SIZE = 60;

/**
 * Mensaje por defecto de la burbujita.
 */
const DEFAULT_BUBBLE_MESSAGE = '¡Chalberos!';

/**
 * Umbrales para reconocer "tap" vs "drag".
 */
const TAP_THRESHOLD = 8;      // Máxima distancia en px
const TAP_TIME_THRESHOLD = 150; // Tiempo máximo en ms para un tap

/**
 * Margen usado para separarse de los bordes de la pantalla
 * (se ajusta en mobile vs escritorio).
 */
const MARGIN_MOBILE = 30;
const MARGIN_DESKTOP = 20;

/** Parámetros de la crucecita “cerrar” */
const CROSS_SIZE = 50;
const CROSS_BG_COLOR = 'transparent';
const CROSS_BORDER = '2px solid #0d47a1';
const CROSS_COLOR = '#0d47a1';
const CLOSE_THRESHOLD = 60; // Distancia para “cerrar” cuando se suelta cerca

/* --------------------------------------------------------------------------
   2) COMPONENTE PRINCIPAL: FloatingChatIcon
   -------------------------------------------------------------------------- */
export default function FloatingChatIcon({ onClick }) {
  const containerRef = useRef(null);

  // Manejo de tiempo (para ver si es tap vs drag)
  const [startTime, setStartTime] = useState(0);

  // Control de selección y visibilidad del ícono
  const [isSelected, setIsSelected] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Manejo de ventana
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Guardar posición inicial para ubicar la crucecita
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Muestra la crucecita mientras arrastras
  const [isDragging, setIsDragging] = useState(false);

  // Posición (x, y) con react-spring
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));

  /**
   * Escucha evento global "show-floating-icon" para volver
   * a mostrar el ícono cuando el modal se cierra.
   */
  useEffect(() => {
    const handleShowIcon = () => {
      setIsHidden(false);
    };
    window.addEventListener('show-floating-icon', handleShowIcon);
    return () => {
      window.removeEventListener('show-floating-icon', handleShowIcon);
    };
  }, []);

  // Manejo de tamaño de ventana
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  /**
   * Ubicación inicial en la esquina inferior derecha.
   */
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    requestAnimationFrame(() => {
      const isMobile = window.innerWidth <= 768;
      const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;

      // Posición inicial
      let x = window.innerWidth - CONTAINER_WIDTH - margin;
      let y = window.innerHeight - CONTAINER_HEIGHT - margin;

      // Evita que quede fuera de pantalla
      if (x < margin) x = margin;
      if (y < margin) y = margin;

      api.start({ x, y });
      setInitialPos({ x, y });
    });
  }, [api]);

  /**
   * Cierra 'selección' si se hace clic/touch fuera
   */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSelected &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsSelected(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSelected]);

  /**
   * Lógica de arrastre con use-gesture
   */
  const bind = useDrag(
    ({ offset: [ox, oy], first, last, movement: [mx, my] }) => {
      if (first) {
        setIsSelected(true);
        setIsDragging(true);
        setStartTime(Date.now());
      }

      if (!windowSize.width || !windowSize.height) return;
      const { width: wWidth, height: wHeight } = windowSize;

      // Ajustes para no salir de los límites
      const clampedX = Math.min(Math.max(ox, 0), wWidth - CONTAINER_WIDTH);
      const clampedY = Math.min(Math.max(oy, 0), wHeight - CONTAINER_HEIGHT);

      api.start({ x: clampedX, y: clampedY });

      if (last) {
        setIsDragging(false);
        setIsSelected(false);

        // Detecta "tap" (poco desplazamiento y poco tiempo)
        const elapsed = Date.now() - startTime;
        const distance = Math.hypot(mx, my);
        const isTap = distance < TAP_THRESHOLD && elapsed < TAP_TIME_THRESHOLD;

        if (isTap) {
          // Al abrir el modal, ocultamos el ícono.
          onClick?.();
          setIsHidden(true);
          return;
        }

        // Si no es tap, evaluar si se soltó cerca de la crucecita
        const iconCenterX = clampedX + CONTAINER_WIDTH / 2;
        const iconCenterY = clampedY + CONTAINER_HEIGHT / 2;

        // Crucecita está centrada horizontalmente y a la altura inicial del ícono
        const crossCenterX = wWidth / 2;
        const crossCenterY = initialPos.y + (CONTAINER_HEIGHT - CROSS_SIZE) / 2 + CROSS_SIZE / 2;

        const distToCross = Math.hypot(iconCenterX - crossCenterX, iconCenterY - crossCenterY);

        if (distToCross < CLOSE_THRESHOLD) {
          setIsHidden(true);
        }
      }
    },
    {
      from: () => [style.x.get(), style.y.get()],
      filterTaps: false,
    }
  );

  // Si el ícono está oculto, no renderizamos nada
  if (isHidden) return null;

  return (
    <>
      {/* CRUCECITA GRIS, APARECE SOLO DURANTE ARRASTRE */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            key="close-cross"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              // Misma altura que el ícono según su posición inicial
              top: initialPos.y + (CONTAINER_HEIGHT - CROSS_SIZE) / 2,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9998,
              width: CROSS_SIZE,
              height: CROSS_SIZE,
              borderRadius: '50%',
              backgroundColor: CROSS_BG_COLOR,
              border: CROSS_BORDER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              pointerEvents: 'none', // no interfiere con el drag
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: CROSS_COLOR,
                lineHeight: 1,
              }}
            >
              X
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENEDOR DEL ÍCONO FLOTANTE */}
      <animated.div
        ref={containerRef}
        {...bind()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT,
          x: style.x,
          y: style.y,
          zIndex: 9999,
          userSelect: 'none',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          cursor: isSelected ? 'grabbing' : 'grab',
        }}
      >
        {/* Burbujita de texto (opcional) */}
        <AnimatePresence>
          {DEFAULT_BUBBLE_MESSAGE && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{
                marginBottom: 8,
                padding: '8px 16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                fontSize: '0.75rem',
                color: '#333333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              {DEFAULT_BUBBLE_MESSAGE}
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid #FFFFFF`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ícono flotante (Chat) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{
            scale: 0.9,
            background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 90%)',
            borderRadius: '50%',
          }}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 90%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Chat Icon"
            sx={{
              width: ICON_SIZE * 0.6,
              height: ICON_SIZE * 0.6,
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />
        </motion.div>
      </animated.div>
    </>
  );
}
