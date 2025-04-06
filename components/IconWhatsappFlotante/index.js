"use client";

/****************************************************************************************
 * File: IconWhatsappFlotante.js
 * --------------------------------------------------------------------------------------
 * Componente 100% independiente para un ícono flotante de WhatsApp + Modal con la
 * misma paleta de colores/gradiente que ChatStylesConfig.js.
 *
 * OBJETIVO:
 *  - Mantener el mismo gradiente y estilos de ChatStylesConfig sin depender directamente
 *    de ese archivo (100% desacoplado).
 *  - Ofrecer un botón flotante (arrastrable) que al hacer click/tap abre un modal,
 *    el cual muestra un input y un botón para enviar mensajes por WhatsApp.
 *  - Mostrar también un botón opcional para abrir un repositorio en GitHub.
 *
 * PRÁCTICAS:
 *  - Principios SOLID (SRP, OCP, LSP, ISP, DIP) y Clean Code (código auto-documentado).
 *  - Sin referencias externas: todo el estilo está contenido aquí (KISS, DRY).
 *
 * LICENCIA:
 *  - MIT License.
 ****************************************************************************************/

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { motion, AnimatePresence } from "framer-motion";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

/* ==========================================================================
   1) HOOK isomórfico: useIsomorphicLayoutEffect
   ==========================================================================
   Evita problemas de SSR al usar useLayoutEffect sólo en el cliente.
   ========================================================================== */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ==========================================================================
   2) CONSTANTES DE ESTILO Y CONFIGURACIÓN (replicando ChatStylesConfig)
   ==========================================================================
   Ajusta estos valores para que el modal/ícono tengan la misma apariencia
   (gradiente, colores, etc.) que tu ChatStylesConfig, pero de forma independiente.
   ========================================================================== */

/** Gradiente principal (igual que ChatStylesConfig) */
const GRADIENT_BG = "linear-gradient(1116deg, #0d47a1 10%, #ffffff 120%)";

/** Colores y estilos centrales */
const COLOR_MODAL_BG = GRADIENT_BG;  // Fondo principal en gradiente
const COLOR_APPBAR_BG = GRADIENT_BG; // Barra superior, mismo gradiente
const COLOR_APPBAR_HOVER = "transparent";
const COLOR_BRAND_TITLE = "#0d47a1";
const COLOR_CLOSE_BUTTON = "#FFFFFF";  // Ícono de cierre (blanco)
const COLOR_MESSAGE_LIST_BG = "transparent"; // Fondo del contenedor
const COLOR_TEXTFIELD_BG = "transparent";    // Fondo del TextField
const COLOR_TEXTFIELD_BORDER = "1px solid #ddd";
const COLOR_TEXTFIELD_FONT_SIZE = "0.85rem";
const COLOR_BUTTON_ACCENT = "#0d47a1";
const COLOR_BUTTON_HOVER = "#0d47a1";

/** Dimensiones */
const ICON_SIZE = 100;
const MODAL_WIDTH = 360;
const MODAL_HEIGHT_DESKTOP = "70vh";
const MODAL_HEIGHT_MOBILE = "90vh";
const MODAL_MAX_HEIGHT = "90vh";
const MODAL_ZINDEX = 9999;
const MODAL_BORDER_RADIUS = 12;
const TOOLBAR_MIN_HEIGHT = 42;
const TAP_THRESHOLD = 5;             // Umbral para distinguir drag de tap
const MARGIN_MOBILE = 10;
const MARGIN_DESKTOP = 20;

/** WhatsApp: número y repositorio (opcional) */
const PHONE_NUMBER = "5292364655702";
const REPO_URL = "https://github.com/gabrielmiguelok/talberos";

/* ==========================================================================
   3) COMPONENTE ChatModal (uso interno)
   ========================================================================== */
function ChatModal({ onClose, isEnglish }) {
  // Textos multilenguaje
  const WELCOME_MESSAGE = isEnglish
    ? "Hello! Welcome to this MIT-licensed open source repository. Feel free to explore and contribute."
    : "¡Hola! Este repositorio open source con licencia MIT te da la bienvenida. Explora y contribuye libremente.";

  const REPO_BUTTON_LABEL = isEnglish
    ? "I want to see the REPO"
    : "Quiero ver el REPO";

  const PLACEHOLDER_TEXT = isEnglish
    ? "Type your message..."
    : "Escribe tu mensaje...";

  // Manejo del input
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll automático cuando el mensaje cambia
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessage]);

  /**
   * Envía el mensaje a WhatsApp
   */
  const handleSend = () => {
    try {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: "submit_whatsapp_form" });
      }
      const trimmed = userMessage.trim();
      if (trimmed.length > 0) {
        const url = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${encodeURIComponent(
          trimmed
        )}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error al enviar mensaje a WhatsApp:", error);
    }
  };

  /**
   * Envía con Enter
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Abre el repositorio en otra pestaña
   */
  const handleOpenRepo = () => {
    try {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: "open_repo_link" });
      }
      window.open(REPO_URL, "_blank");
    } catch (error) {
      console.error("Error al abrir el repositorio:", error);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: { xs: "100%", sm: MODAL_WIDTH },
        height: { xs: MODAL_HEIGHT_MOBILE, sm: MODAL_HEIGHT_DESKTOP },
        maxHeight: MODAL_MAX_HEIGHT,
        background: COLOR_MODAL_BG,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        borderTopRightRadius: MODAL_BORDER_RADIUS,
        borderTopLeftRadius: MODAL_BORDER_RADIUS,
        zIndex: MODAL_ZINDEX,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Encabezado (AppBar) */}
      <AppBar
        position="static"
        sx={{
          background: COLOR_APPBAR_BG,
          boxShadow: "none",
          borderTopRightRadius: MODAL_BORDER_RADIUS,
          borderTopLeftRadius: MODAL_BORDER_RADIUS
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: TOOLBAR_MIN_HEIGHT }}>
          <Typography
            variant="subtitle1"
            sx={{
              flex: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              color: COLOR_CLOSE_BUTTON
            }}
          >
            Icon Whatsapp MIT
          </Typography>
          <IconButton onClick={onClose} sx={{ color: COLOR_CLOSE_BUTTON }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Cuerpo principal */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          background: COLOR_MESSAGE_LIST_BG,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {/* Mensaje de bienvenida */}
        <Box
          sx={{
            backgroundColor: "#cee9ff",
            color: "#1F1F1F",
            p: 1.5,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "80%",
            fontSize: "0.95rem"
          }}
        >
          {WELCOME_MESSAGE}
        </Box>

        {/* Botón para abrir el repositorio */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleOpenRepo}
            sx={{
              backgroundColor: COLOR_APPBAR_HOVER,
              color: COLOR_CLOSE_BUTTON,
              textTransform: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: COLOR_APPBAR_HOVER,
                opacity: 0.9
              }
            }}
          >
            {REPO_BUTTON_LABEL}
          </Button>
        </Box>

        <Box sx={{ flex: 1 }} />
        <div ref={messagesEndRef} />
      </Box>

      {/* Footer: TextField + botón de envío */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderTop: COLOR_TEXTFIELD_BORDER,
          p: 1,
          background: COLOR_TEXTFIELD_BG
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder={PLACEHOLDER_TEXT}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            fontSize: COLOR_TEXTFIELD_FONT_SIZE
          }}
        />
        <IconButton
          onClick={handleSend}
          sx={{
            ml: 1,
            backgroundColor: COLOR_APPBAR_HOVER,
            color: COLOR_CLOSE_BUTTON,
            "&:hover": {
              backgroundColor: COLOR_APPBAR_HOVER,
              opacity: 0.9
            }
          }}
        >
          <SendRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

/* ==========================================================================
   4) CRUCECITA GRIS PARA CERRAR
   ========================================================================== */
/** Parámetros de la crucecita “cerrar” */
const CROSS_SIZE = 50;
const CROSS_BG_COLOR = 'transparent';
const CROSS_BORDER = '2px solid #0d47a1';
const CROSS_COLOR = '#0d47a1';
const CLOSE_THRESHOLD = 60; // Distancia para “cerrar” cuando se suelta cerca


/* ==========================================================================
   5) COMPONENTE FloatingChatIcon (arrastrable + crucecita)
   ========================================================================== */
function FloatingChatIcon({ onClick }) {
  const iconRef = useRef(null);

  // Tamaño de la ventana
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  // Posición inicial para ubicar la crucecita (guardamos x,y)
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // React Spring: x, y => posición actual del ícono
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));

  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Dimensiones del ícono (para clamping)
  const [iconRect, setIconRect] = useState({
    width: ICON_SIZE,
    height: ICON_SIZE
  });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Posición inicial en la esquina inferior izquierda
  useIsomorphicLayoutEffect(() => {
    if (iconRef.current && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const rect = iconRef.current.getBoundingClientRect();
        const measuredWidth = rect.width || ICON_SIZE;
        const measuredHeight = rect.height || ICON_SIZE;
        setIconRect({ width: measuredWidth, height: measuredHeight });

        const isMobile = window.innerWidth <= 768;
        const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;

        let defaultX = margin;
        let defaultY = window.innerHeight - measuredHeight - margin;
        if (defaultY < margin) {
          defaultY = margin;
        }

        api.start({ x: defaultX, y: defaultY });
        setInitialPos({ x: defaultX, y: defaultY });
      });
    }
  }, [api]);

  // Deseleccionar ícono si se hace click/touch fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSelected && iconRef.current && !iconRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSelected]);

  // Lógica de arrastre con use-gesture
  const bind = useDrag(
    ({ offset: [ox, oy], first, last, movement: [mx, my] }) => {
      if (first) {
        setIsSelected(true);
        setIsDragging(true);
      }

      if (!windowSize.width || !windowSize.height) return;
      const { width: wWidth, height: wHeight } = windowSize;
      const { width: iWidth, height: iHeight } = iconRect;

      // Clamping para no salirse de la pantalla
      const clampedX = Math.min(Math.max(ox, 0), wWidth - iWidth);
      const clampedY = Math.min(Math.max(oy, 0), wHeight - iHeight);

      api.start({ x: clampedX, y: clampedY });

      if (last) {
        setIsDragging(false);
        setIsSelected(false);

        // Distancia del arrastre para ver si es "tap"
        if (Math.hypot(mx, my) < TAP_THRESHOLD) {
          onClick?.();
          return;
        }

        // Si no es tap, ver si suelto cerca de la crucecita => esconder
        const iconCenterX = clampedX + iWidth / 2;
        const iconCenterY = clampedY + iHeight / 2;

        // Crucecita centrada horizontalmente, misma altura "inicial" del ícono
        const crossCenterX = wWidth / 2;
        const crossCenterY =
          initialPos.y + (ICON_SIZE - CROSS_SIZE) / 2 + CROSS_SIZE / 2;

        const distToCross = Math.hypot(iconCenterX - crossCenterX, iconCenterY - crossCenterY);

        if (distToCross < CLOSE_THRESHOLD) {
          setIsHidden(true);
        }
      }
    },
    {
      from: () => [style.x.get(), style.y.get()],
      filterTaps: false
    }
  );

  // Si el ícono se cerró, no renderizamos nada
  if (isHidden) return null;

  return (
    <>
      {/* CRUCECITA GRIS (aparece mientras arrastras) */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            key="close-cross"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: initialPos.y + (ICON_SIZE - CROSS_SIZE) / 2,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: MODAL_ZINDEX - 1,
              width: CROSS_SIZE,
              height: CROSS_SIZE,
              borderRadius: "50%",
              backgroundColor: CROSS_BG_COLOR,
              border: CROSS_BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              pointerEvents: "none"
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: CROSS_COLOR,
                lineHeight: 1
              }}
            >
              X
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÍCONO FLOTANTE */}
      <animated.div
        ref={iconRef}
        {...bind()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: style.x,
          y: style.y,
          zIndex: MODAL_ZINDEX,
          userSelect: "none",
          touchAction: "none"
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isSelected ? "grabbing" : "grab"
          }}
        >
          <Box
            component="img"
            src="/wpicon.png"
            alt="WhatsApp Icon"
            draggable={false}
            sx={{
              width: ICON_SIZE * 0.6,
              height: ICON_SIZE * 0.6,
              objectFit: "contain"
            }}
          />
        </motion.div>
      </animated.div>
    </>
  );
}

/* ==========================================================================
   6) COMPONENTE PRINCIPAL: ChatWhatsAppFloat
   ========================================================================== */
export function ChatWhatsAppFloat({ isEnglish = false }) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Abre/cierra el modal y manda eventos a dataLayer
   */
  const handleToggleChat = () => {
    try {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: isOpen ? "close_whatsapp_form" : "open_whatsapp_form"
        });
      }
    } catch (error) {
      console.error("Error al pushear evento:", error);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {!isOpen && <FloatingChatIcon onClick={handleToggleChat} />}
      {isOpen && <ChatModal onClose={handleToggleChat} isEnglish={isEnglish} />}
    </>
  );
}
