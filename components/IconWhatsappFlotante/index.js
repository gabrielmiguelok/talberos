"use client";

/**
 * MIT License
 * -----------
 * Archivo: /components/IconWhatsappFlotante.js
 *
 * DESCRIPCIÓN:
 *   - Proporciona un botón flotante de WhatsApp draggable y un modal para
 *     enviar mensajes directamente a un número definido.
 *   - Incluye animaciones con framer-motion y la capacidad de cambiar entre
 *     idioma español e inglés de forma dinámica.
 *
 * OBJETIVO:
 *   - Facilitar la interacción con WhatsApp desde cualquier punto de la app,
 *     sin costos adicionales, gracias a la licencia MIT.
 *   - Ofrecer un botón adicional para acceder directamente al repositorio GitHub.
 *   - Cumplir con buenas prácticas de diseño y estructura siguiendo los
 *     principios SOLID y Clean Code.
 *
 * PRINCIPIOS SOLID:
 *   1. Single Responsibility Principle (SRP):
 *      - Cada subcomponente (ChatModal, FloatingChatIcon, ChatWhatsAppFloat)
 *        maneja una responsabilidad específica:
 *        - ChatModal: lógica y UI del modal de chat.
 *        - FloatingChatIcon: ícono flotante draggable.
 *        - ChatWhatsAppFloat: orquestación y manejo de estado entre ícono y modal.
 *   2. Open/Closed Principle (OCP):
 *      - Puede extenderse el comportamiento (p. ej., nuevos idiomas o estilos)
 *        sin modificar el núcleo.
 *   3. Liskov Substitution Principle (LSP):
 *      - No se utiliza herencia directa; sin embargo, los componentes se
 *        integran de forma intercambiable mientras cumplan la misma interfaz (props).
 *   4. Interface Segregation Principle (ISP):
 *      - Cada componente expone solo las props necesarias (isEnglish, onClose, etc.).
 *   5. Dependency Inversion Principle (DIP):
 *      - No se depende de implementaciones concretas del usuario, sino de
 *        APIs externas (React, Material UI, etc.).
 *
 * LICENCIA:
 *   - Este código se ofrece con fines educativos bajo licencia MIT.
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
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
import { useDrag } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";

/* ==========================================================================
   1) CONFIGURACIONES DE ESTILO Y CONSTANTES
   ========================================================================== */

/**
 * Número de teléfono de WhatsApp, con código de país.
 * @type {string}
 */
const PHONE_NUMBER = "5292364655702";

/**
 * URL del repositorio a mostrar al usuario.
 */
const REPO_URL = "https://github.com/gabrielmiguelok/talberos";

/**
 * Tamaño base del ícono flotante en píxeles.
 * @type {number}
 */
const ICON_SIZE = 100;

/**
 * Dimensiones del Modal de chat.
 */
const MODAL_WIDTH = 360;
const MODAL_HEIGHT_DESKTOP = "70vh";
const MODAL_HEIGHT_MOBILE = "90vh";

/**
 * Paleta de colores principal, basada en tonos rosa/fucsia y fondos oscuros.
 */
const HEADER_BG_COLOR = "#FF00AA";
const HEADER_TEXT_COLOR = "#FFFFFF";
const HEADER_BORDER_COLOR = "#FF44C4";

const BODY_BG_COLOR = "#121212";
const BODY_TEXT_COLOR = "#FFFFFF";
const BODY_PADDING = 6;

const FOOTER_BG_COLOR = "#1F1F1F";
const FOOTER_BORDER_COLOR = "#FF44C4";
const INPUT_BG_COLOR = "#242424";
const INPUT_TEXT_COLOR = "#FFFFFF";

/**
 * Colores para el botón de envío.
 */
const SEND_BUTTON_COLOR = "#FF00AA";
const SEND_BUTTON_HOVER_BG = "#FF44C4";

/**
 * Umbral de movimiento para detectar "tap" en lugar de un drag real.
 * @type {number}
 */
const TAP_THRESHOLD = 5;

/* ==========================================================================
   2) COMPONENTE ChatModal
   ========================================================================== */

/**
 * @typedef {Object} ChatModalProps
 * @property {Function} onClose - Función para cerrar el modal.
 * @property {boolean} isEnglish - Indica si se muestra en inglés o en español.
 */

/**
 * Modal de chat que muestra un mensaje de bienvenida y permite enviar textos
 * personalizados a través de WhatsApp. Además, incluye un botón para ver
 * el repositorio en GitHub.
 *
 * @param {ChatModalProps} props
 * @returns {JSX.Element}
 */
function ChatModal({ onClose, isEnglish }) {
  // Mensajes y placeholders de texto multilenguaje
  const WELCOME_MESSAGE = isEnglish
    ? "Hello! Welcome to this MIT-licensed open source repository. Feel free to explore and contribute."
    : "¡Hola! Este repositorio open source con licencia MIT te da la bienvenida. Explora y contribuye libremente.";

  // Botón para abrir el repositorio en GitHub
  const REPO_BUTTON_LABEL = isEnglish
    ? "I want to see the REPO"
    : "Quiero ver el REPO";

  // Placeholder del input
  const PLACEHOLDER_TEXT = isEnglish
    ? "Type your message..."
    : "Escribe tu mensaje...";

  // Texto escrito por el usuario
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Efecto para auto-hacer scroll al final cuando cambia el mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessage]);

  /**
   * Maneja el envío de mensajes a WhatsApp.
   */
  const handleSend = () => {
    try {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: "submit_whatsapp_form" });
      }
      const finalMsg = userMessage.trim();
      if (finalMsg.length > 0) {
        const url = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${encodeURIComponent(
          finalMsg
        )}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error al enviar mensaje a WhatsApp:", error);
    }
  };

  /**
   * Permite enviar el mensaje al presionar Enter.
   * @param {React.KeyboardEvent} e - Evento del teclado.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Redirige al usuario al repositorio en GitHub.
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
        maxHeight: "90vh",
        backgroundColor: BODY_BG_COLOR,
        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/** Encabezado del modal */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: HEADER_BG_COLOR,
          boxShadow: "none",
          borderBottom: `1px solid ${HEADER_BORDER_COLOR}`
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: "42px" }}>
          <Typography
            variant="subtitle1"
            sx={{
              flex: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              color: HEADER_TEXT_COLOR
            }}
          >
            Icon Whatsapp MIT
          </Typography>
          <IconButton onClick={onClose} sx={{ color: HEADER_TEXT_COLOR }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/** Cuerpo del modal */}
      <Box
        sx={{
          flex: 1,
          p: BODY_PADDING / 2,
          backgroundColor: BODY_BG_COLOR,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto"
        }}
      >
        {/** Mensaje de bienvenida */}
        <Box
          sx={{
            backgroundColor: "#2E2E2E",
            color: BODY_TEXT_COLOR,
            p: 1.5,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "80%",
            fontSize: "0.95rem"
          }}
        >
          {WELCOME_MESSAGE}
        </Box>

        {/** Botón para abrir el repositorio en GitHub */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleOpenRepo}
            sx={{
              backgroundColor: SEND_BUTTON_COLOR,
              color: "#fff",
              textTransform: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              "&:hover": { backgroundColor: SEND_BUTTON_COLOR }
            }}
          >
            {REPO_BUTTON_LABEL}
          </Button>
        </Box>

        <Box sx={{ flex: 1 }} />
        <div ref={messagesEndRef} />
      </Box>

      {/** Footer: campo de texto + botón de enviar */}
      <Box
        sx={{
          backgroundColor: FOOTER_BG_COLOR,
          borderTop: `1px solid ${FOOTER_BORDER_COLOR}`,
          p: 1,
          display: "flex",
          alignItems: "center"
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
            mr: 1,
            backgroundColor: INPUT_BG_COLOR,
            "& .MuiOutlinedInput-root": {
              fontSize: "0.85rem",
              color: INPUT_TEXT_COLOR
            }
          }}
        />
        <IconButton
          onClick={handleSend}
          sx={{
            backgroundColor: "transparent",
            color: SEND_BUTTON_COLOR,
            width: 38,
            height: 38,
            "&:hover": {
              backgroundColor: SEND_BUTTON_HOVER_BG
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

/* ==========================================================================
   3) COMPONENTE FloatingChatIcon
   ========================================================================== */

/**
 * @typedef {Object} FloatingChatIconProps
 * @property {Function} onClick - Se ejecuta cuando el ícono es "tocado" (tap) o clicado.
 */

/**
 * Ícono flotante de WhatsApp que permite arrastrar y soltar (drag & drop).
 * Al "soltar" sin desplazarlo significativamente, dispara `onClick`.
 *
 * @param {FloatingChatIconProps} props
 * @returns {JSX.Element}
 */
function FloatingChatIcon({ onClick }) {
  const iconRef = useRef(null);

  // Tamaño de la ventana y dimensión real del ícono
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [iconRect, setIconRect] = useState({ width: ICON_SIZE, height: ICON_SIZE });

  // Manejo de posición con react-spring
  const [style, api] = useSpring(() => ({ x: 0, y: 0 }));

  // Controla si se está arrastrando o no
  const [isSelected, setIsSelected] = useState(false);

  // Actualiza las dimensiones de la ventana
  useEffect(() => {
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calcula la posición inicial del ícono usando LayoutEffect
  useLayoutEffect(() => {
    if (iconRef.current) {
      requestAnimationFrame(() => {
        const rect = iconRef.current.getBoundingClientRect();
        const measuredWidth = rect.width || ICON_SIZE;
        const measuredHeight = rect.height || ICON_SIZE;
        setIconRect({ width: measuredWidth, height: measuredHeight });

        const isMobile = window.innerWidth <= 768;
        const margin = isMobile ? 10 : 20;

        const defaultX = margin;
        let defaultY = window.innerHeight - measuredHeight - margin;
        if (defaultY < 10) {
          defaultY = 10;
        }

        // Posición inicial del ícono
        api.start({ x: defaultX, y: defaultY });
      });
    }
  }, [api]);

  // Cierra la selección si se hace clic fuera del ícono
  useEffect(() => {
    function handleClickOutside(e) {
      if (isSelected && iconRef.current && !iconRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSelected]);

  /**
   * Configura la lógica de arrastre con use-gesture.
   * Si el movimiento total es menor a TAP_THRESHOLD, se considera un "tap".
   */
  const bind = useDrag(
    ({ offset: [ox, oy], first, last, movement: [mx, my] }) => {
      if (first) {
        setIsSelected(true);
      }
      const { width: wWidth, height: wHeight } = windowSize;
      const { width: iWidth, height: iHeight } = iconRect;

      // Limita la posición para no salir de pantalla
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
        zIndex: 9999,
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
  );
}

/* ==========================================================================
   4) COMPONENTE PRINCIPAL: ChatWhatsAppFloat
   ========================================================================== */

/**
 * @typedef {Object} ChatWhatsAppFloatProps
 * @property {boolean} [isEnglish=false] - Determina el idioma (Español/Inglés) del modal.
 */

/**
 * Componente contenedor que orquesta el ícono flotante de WhatsApp y el modal.
 * - Muestra el ícono flotante. Al hacer clic (o tap) en él, se abre el modal.
 * - Cuando el modal está abierto, oculta el ícono flotante.
 *
 * @param {ChatWhatsAppFloatProps} props
 * @returns {JSX.Element}
 */
export function ChatWhatsAppFloat({ isEnglish = false }) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Alterna la visibilidad del modal y registra eventos en dataLayer
   * (para Google Tag Manager u otros sistemas de analítica).
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
      {/* Ícono flotante arrastrable, se esconde si el modal está abierto */}
      {!isOpen && <FloatingChatIcon onClick={handleToggleChat} />}

      {/* Modal de chat; se muestra solo si isOpen es true */}
      {isOpen && <ChatModal onClose={handleToggleChat} isEnglish={isEnglish} />}
    </>
  );
}
