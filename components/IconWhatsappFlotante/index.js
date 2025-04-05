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

import { motion } from "framer-motion";
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
const COLOR_MODAL_BG = GRADIENT_BG;        // Fondo principal en gradiente
const COLOR_APPBAR_BG = GRADIENT_BG;       // Barra superior, mismo gradiente
const COLOR_APPBAR_HOVER = "transparent";      // Hover en la barra
const COLOR_BRAND_TITLE = "#0d47a1";       // Texto de marca (opcional)
const COLOR_CLOSE_BUTTON = "#FFFFFF";      // Ícono de cierre (blanco)

const COLOR_MESSAGE_LIST_BG = "transparent";    // Fondo del contenedor
const COLOR_TEXTFIELD_BG = "transparent";       // Fondo del TextField
const COLOR_TEXTFIELD_BORDER = "1px solid #ddd";// Borde superior del TextField Container
const COLOR_TEXTFIELD_FONT_SIZE = "0.85rem";

const COLOR_BUTTON_ACCENT = "#0d47a1";    // Botón de envío (rosa principal)
const COLOR_BUTTON_HOVER = "#0d47a1";     // Hover del botón

/** Dimensiones */
const ICON_SIZE = 100;                    // Tamaño del ícono flotante
const MODAL_WIDTH = 360;                 // Ancho del modal (en sm y adelante)
const MODAL_HEIGHT_DESKTOP = "70vh";     // Alto en desktop
const MODAL_HEIGHT_MOBILE = "90vh";      // Alto en mobile
const MODAL_MAX_HEIGHT = "90vh";         // Máximo alto
const MODAL_ZINDEX = 9999;               // Z-index por encima de todo
const MODAL_BORDER_RADIUS = 12;          // Borde redondeado del modal
const TOOLBAR_MIN_HEIGHT = 42;           // Mínimo en la toolbar (AppBar)
const TAP_THRESHOLD = 5;                 // Umbral para distinguir drag de tap

/** Margenes (espacios) para el ícono flotante */
const MARGIN_MOBILE = 10;
const MARGIN_DESKTOP = 20;

/** WhatsApp: número y repositorio (opcional) */
const PHONE_NUMBER = "5292364655702";
const REPO_URL = "https://github.com/gabrielmiguelok/talberos";

/* ==========================================================================
   3) COMPONENTE ChatModal (uso interno)
   ==========================================================================
   - Muestra un AppBar con gradiente, un cuerpo con mensaje de bienvenida y
     botón para abrir un repo, y un footer con TextField + botón para enviar
     mensaje a WhatsApp.
   - 100% estilos inline (sx), sin depender de otros archivos.
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
   * Envía el mensaje a WhatsApp (usando api.whatsapp.com).
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
        background: COLOR_MODAL_BG, // Gradiente igual que el chat
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        borderTopRightRadius: MODAL_BORDER_RADIUS,
        borderTopLeftRadius: MODAL_BORDER_RADIUS,
        zIndex: MODAL_ZINDEX,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Encabezado (AppBar) con el mismo gradiente */}
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
              color: COLOR_CLOSE_BUTTON // Blanco
            }}
          >
            Icon Whatsapp MIT
          </Typography>
          <IconButton onClick={onClose} sx={{ color: COLOR_CLOSE_BUTTON }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Cuerpo principal del modal */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          // Fondo transparente para "ver" el gradiente si quieres
          background: COLOR_MESSAGE_LIST_BG,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {/* Mensaje de bienvenida */}
        <Box
          sx={{
            backgroundColor: "#cee9ff", // Similar a ChatStylesConfig
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

        {/* Empuja al final y mantiene el scroll */}
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
   4) COMPONENTE FloatingChatIcon (interno)
   ==========================================================================
   Ícono flotante arrastrable, por defecto en la esquina inferior izquierda.
   Uso de react-spring y use-gesture para el drag & drop.
   ========================================================================== */
function FloatingChatIcon({ onClick }) {
  const iconRef = useRef(null);

  // Tamaño de la ventana
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  // Dimensiones del ícono calculadas tras montarse
  const [iconRect, setIconRect] = useState({ width: ICON_SIZE, height: ICON_SIZE });
  // Posición animada (x, y) con react-spring
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));
  const [isSelected, setIsSelected] = useState(false);

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

  // Posición inicial en la esquina inferior izquierda (solo en cliente)
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
      });
    }
  }, [api]);

  // Des-selecciona ícono si se hace click/touch fuera de él
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

  // Manejo del arrastre: si movement < TAP_THRESHOLD, consideramos "tap" y llamamos onClick
  const bind = useDrag(
    ({ offset: [ox, oy], first, last, movement: [mx, my] }) => {
      if (first) setIsSelected(true);

      const { width: wWidth, height: wHeight } = windowSize;
      const { width: iWidth, height: iHeight } = iconRect;

      const clampedX = Math.min(Math.max(ox, 0), wWidth - iWidth);
      const clampedY = Math.min(Math.max(oy, 0), wHeight - iHeight);

      api.start({ x: clampedX, y: clampedY });

      // Detecta "tap"
      if (last) {
        setIsSelected(false);
        if (Math.hypot(mx, my) < TAP_THRESHOLD) {
          onClick();
        }
      }
    },
    {
      from: () => [style.x.get(), style.y.get()],
      filterTaps: false
    }
  );

  return (
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
        {/* Ajusta la ruta al ícono de tu preferencia (ej. /wpicon.png) */}
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
  );
}

/* ==========================================================================
   5) COMPONENTE PRINCIPAL: ChatWhatsAppFloat
   ==========================================================================
   Muestra el FloatingChatIcon y, cuando se hace click/tap, abre el ChatModal.
   ========================================================================== */
export function ChatWhatsAppFloat({ isEnglish = false }) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Abre/cierra el modal y opcionalmente manda eventos a dataLayer.
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
