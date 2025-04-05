/****************************************************************************************
 * File: steps/menu/MainSteps.js
 * --------------------------------------------------------------------------------------
 * Estado MAIN (pantalla inicial del Chat).
 *
 * Se ha adaptado el mensaje y las opciones para Talberos, la librería gratuita que
 * permite crear tablas estilo Excel en React.
 ****************************************************************************************/
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

export const MAIN = {
  assistantMessages: [
    '### ¡Hola! Bienvenido a Talberos. ¡Te doy la bienvenida! 🤗',
    'Soy el asistente de Talberos, la librería open source que te permite crear tablas estilo Excel en React de manera sencilla y potente. ¿En qué puedo ayudarte hoy?',
  ],
  options: [
    BUTTON_LABELS.SABER_MAS,       // "Quiero saber más"
    BUTTON_LABELS.VER_FEATURES,    // "Ver Características"
    BUTTON_LABELS.GO_FAQ,          // "FAQ"
    BUTTON_LABELS.GO_ADVISOR,      // "Hablar con un asesor"
  ],
};
