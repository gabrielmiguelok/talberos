/****************************************************************************************
 * File: ChatStylesConfig.js
 * --------------------------------------------------------------------------------------
 * Este archivo centraliza todas las constantes de estilo (propiedades sx de MUI) para:
 *   - ChatModal: Contenedor principal del chat.
 *   - ChatMessage: Estilos para cada mensaje (usuario y asistente).
 *   - ChatOptions: Estilos para las opciones (botones de acción).
 *
 * Modifica estas constantes para cambiar la apariencia del chat sin tener que recorrer el
 * código completo, siguiendo los principios de Clean Code.
 ****************************************************************************************/

import { keyframes } from '@emotion/react';

/* -------------------------------------------------------------------------
 * CONFIGURABLE CONSTANTS (Colores principales)
 * ------------------------------------------------------------------------- */

/**
 * Usamos el mismo gradiente (#FF00AA → #1F1F1F) tanto para la barra superior
 * como para el fondo principal del chat.
 */
const GRADIENT_BG = 'linear-gradient(121135deg, #FF00AA 20%, #1F1F1F 70%)';

const COLOR_MODAL_BG = GRADIENT_BG;           // Fondo principal en gradiente
const COLOR_APPBAR_BG = GRADIENT_BG;          // Barra superior con el mismo gradiente
const COLOR_BRAND_TITLE = '#FFFFFF';          // Texto del título (blanco)
const COLOR_APPBAR_HOVER = '#FF00AA';         // Hover en la barra (rosa principal)
const COLOR_CLOSE_BUTTON = '#FFFFFF';         // Icono de cierre en blanco

// Mantengo el fondo de la lista de mensajes igual al container (gradiente).
const COLOR_MESSAGE_LIST_BG = 'transparent';

// El TextField quedará con el mismo gradiente de fondo o un color opaco (elige uno):
// Si prefieres un fondo opaco, puedes usar #1F1F1F.
// Si quieres el mismo gradiente, ponle 'transparent' o GRADIENT_BG.
const COLOR_TEXTFIELD_BG = 'transparent';
const COLOR_OPTION_BUTTON_TEXT = '#1F1F1F';

// Fondos de los mensajes
const COLOR_MESSAGE_ASSISTANT_BG = '#FCE7F3'; // Rosa clarito
const COLOR_MESSAGE_USER_BG = '#FFD9EE';      // Rosa clarito

// Texto de los mensajes
const COLOR_MESSAGE_TEXT = '#1F1F1F';         // Oscuro

// CTA
const COLOR_CTA_BORDER = '#FF00AA';
const COLOR_CTA_BG = '#1F1F1F';

/* -------------------------------------------------------------------------
 * DIMENSIONES Y ESPACIOS
 * ------------------------------------------------------------------------- */
const MODAL_WIDTH = { xs: '100%', sm: 360 };
const MODAL_HEIGHT = { xs: '90vh', sm: '70vh' };
const MODAL_MAX_HEIGHT = '90vh';
const MODAL_BORDER_RADIUS = 12;
const MODAL_ZINDEX = 9999;
const TOOLBAR_MIN_HEIGHT = '42px';
const TEXTFIELD_BORDER = '1px solid #ddd';
const TEXTFIELD_FONT_SIZE = '0.85rem';
const MESSAGE_MARGIN_BOTTOM = '0.6rem';
const MESSAGE_PADDING = 1.5;
const MESSAGE_MAX_WIDTH = '90%';
const MESSAGE_ASSISTANT_BORDER_RADIUS = '14px 14px 14px 0';
const MESSAGE_USER_BORDER_RADIUS = '14px 14px 0 14px';
const MESSAGE_FONT_SIZE = '0.95rem';
const MESSAGE_LINE_HEIGHT = 1.4;
const CTA_BORDER_RADIUS = '8px';
const CTA_PADDING = '0.8rem';
const CTA_MARGIN = '0.7rem 0';

/* -------------------------------------------------------------------------
 * ANIMACIONES
 * ------------------------------------------------------------------------- */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* -------------------------------------------------------------------------
 * OPCIONES (Botones)
 * -------------------------------------------------------------------------
 * Ahora definimos un degradado rosado "un poco más oscuro"
 * que los fondos #FCE7F3 / #FFD9EE de los mensajes.
 */
const OPTION_BUTTON_GRADIENT = 'linear-gradient(45deg, #F9BCD6 30%, #F5A8C9 90%)';
const OPTION_BUTTON_GRADIENT_HOVER = 'linear-gradient(45deg, #F5A8C9 30%, #F9BCD6 90%)';
const OPTION_BUTTON_BORDER_RADIUS = '20px';
const OPTION_BUTTON_FONT_SIZE = '0.85rem';
const OPTION_BUTTON_FONT_WEIGHT = '500';
const OPTION_BUTTON_TRANSITION = 'transform 0.1s ease-in-out';

/* -------------------------------------------------------------------------
 * ESTILOS DEL MODAL PRINCIPAL (ChatModal)
 * ------------------------------------------------------------------------- */
export const CHAT_MODAL_STYLES = {
  container: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    maxHeight: MODAL_MAX_HEIGHT,
    // Fondo con el mismo gradiente de la barra
    background: COLOR_MODAL_BG,
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    borderTopLeftRadius: MODAL_BORDER_RADIUS,
    borderTopRightRadius: MODAL_BORDER_RADIUS,
    zIndex: MODAL_ZINDEX,
    display: 'flex',
    flexDirection: 'column',
  },
  appBar: {
    borderTopLeftRadius: `${MODAL_BORDER_RADIUS}px`,
    borderTopRightRadius: `${MODAL_BORDER_RADIUS}px`,
    background: COLOR_APPBAR_BG, // el mismo gradiente
  },
  toolBar: {
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },
  brandImageContainer: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    overflow: 'hidden',
  },
  brandTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: COLOR_BRAND_TITLE,
  },
  closeButton: {
    color: COLOR_CLOSE_BUTTON,
  },
  messageListContainer: {
    flex: 1,
    overflowY: 'auto',
    p: 1,
    // Hacemos que sea transparente para que se vea el gradiente del fondo
    background: COLOR_MESSAGE_LIST_BG,
  },
  textFieldContainer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: TEXTFIELD_BORDER,
    p: 1,
    background: COLOR_TEXTFIELD_BG,
  },
  textField: {
    fontSize: TEXTFIELD_FONT_SIZE,
  },
  sendButton: {
    ml: 1,
    // Puedes dejarlo en #FF00AA fijo o combinar con el gradiente
    backgroundColor: COLOR_APPBAR_HOVER,
    color: COLOR_CLOSE_BUTTON,
    '&:hover': {
      backgroundColor: COLOR_APPBAR_HOVER,
      opacity: 0.9,
    },
  },
  finalContainer: {
    textAlign: 'center',
    p: 1,
  },
  finalButton: {
    backgroundColor: COLOR_APPBAR_HOVER,
    color: COLOR_CLOSE_BUTTON,
    '&:hover': {
      backgroundColor: COLOR_APPBAR_HOVER,
      opacity: 0.9,
    },
  },
};

/* -------------------------------------------------------------------------
 * ESTILOS PARA LOS MENSAJES (ChatMessage)
 * ------------------------------------------------------------------------- */
export const CHAT_MESSAGE_STYLES = {
  slideUpAnimation: slideUp,

  messageContainer: (isAssistant) => ({
    display: 'flex',
    justifyContent: isAssistant ? 'flex-start' : 'flex-end',
    marginBottom: MESSAGE_MARGIN_BOTTOM,
  }),

  messagePaper: (isAssistant) => ({
    p: MESSAGE_PADDING,
    maxWidth: MESSAGE_MAX_WIDTH,
    borderRadius: isAssistant
      ? MESSAGE_ASSISTANT_BORDER_RADIUS
      : MESSAGE_USER_BORDER_RADIUS,
    backgroundColor: isAssistant
      ? COLOR_MESSAGE_ASSISTANT_BG
      : COLOR_MESSAGE_USER_BG,
    color: COLOR_MESSAGE_TEXT,
    fontSize: MESSAGE_FONT_SIZE,
    lineHeight: MESSAGE_LINE_HEIGHT,
  }),

  ctaBox: {
    border: `1px solid ${COLOR_CTA_BORDER}`,
    borderRadius: CTA_BORDER_RADIUS,
    padding: CTA_PADDING,
    margin: CTA_MARGIN,
    fontWeight: 'bold',
    backgroundColor: COLOR_CTA_BG,
  },
};

/* -------------------------------------------------------------------------
 * ESTILOS PARA LAS OPCIONES (ChatOptions)
 * ------------------------------------------------------------------------- */
export const CHAT_OPTIONS_STYLES = {
  stackContainer: {
    mt: 2,
    animation: `${fadeInUp} 0.3s ease-in-out`,
  },
  optionButton: {
    textTransform: 'none',
    fontSize: OPTION_BUTTON_FONT_SIZE,
    fontWeight: OPTION_BUTTON_FONT_WEIGHT,
    borderRadius: OPTION_BUTTON_BORDER_RADIUS,
    background: OPTION_BUTTON_GRADIENT,
    color: COLOR_OPTION_BUTTON_TEXT,
    transition: OPTION_BUTTON_TRANSITION,
    '&:hover': {
      background: OPTION_BUTTON_GRADIENT_HOVER,
      transform: 'scale(1.02)',
    },
  },
};
