/****************************************************************************************
 * File: steps/menu/MainRevisitedSteps.js
 * --------------------------------------------------------------------------------------
 * Estado MAIN_REVISITED.
 *
 * Muestra una invitación adicional para que el usuario continúe explorando Talberos.
 ****************************************************************************************/
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

export const MAIN_REVISITED = {
  assistantMessages: [
    '¿En qué más puedo ayudarte? Estoy aquí para lo que necesites en Talberos.',
  ],
  options: [
    BUTTON_LABELS.SABER_MAS,      // "Quiero saber más"
    BUTTON_LABELS.VER_FEATURES,   // "Ver Características"
    BUTTON_LABELS.GO_FAQ,         // "FAQ"
    BUTTON_LABELS.GO_ADVISOR,     // "Hablar con un asesor"
  ],
};
