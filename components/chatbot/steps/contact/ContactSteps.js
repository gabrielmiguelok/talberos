/****************************************************************************************
 * File: steps/contact/ContactSteps.js
 * --------------------------------------------------------------------------------------
 * Estado CONTACTO.
 *
 * Muestra información de contacto adaptada a Talberos, invitando al usuario a
 * comunicarse vía WhatsApp para obtener más información.
 ****************************************************************************************/
import { WHATSAPP_LINK } from '../links/ChatLinks';
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

export const CONTACTO = {
  assistantMessages: [
    `¡Perfecto! Para obtener más información sobre Talberos, por favor contáctanos por [WhatsApp](${WHATSAPP_LINK}).`,
    `¿Deseas regresar al **${BUTTON_LABELS.GO_MAIN}** o **${BUTTON_LABELS.FINISH}**?`,
  ],
  options: [
    BUTTON_LABELS.GO_MAIN,   // "Menú Principal"
    BUTTON_LABELS.FINISH,    // "Finalizar"
  ],
};
