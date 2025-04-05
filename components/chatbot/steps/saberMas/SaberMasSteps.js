/****************************************************************************************
 * File: steps/saberMas/SaberMasSteps.js
 * --------------------------------------------------------------------------------------
 * Estado SABER_MAS.
 *
 * Muestra un mensaje informativo sobre las funcionalidades de Talberos y ofrece
 * opciones para ver un video demostrativo, un testimonio o conocer más sobre la integración.
 ****************************************************************************************/
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

export const SABER_MAS = {
  assistantMessages: [
    'Con Talberos podrás:\n\n' +
    '- **Crear tablas** al estilo Excel en React.\n' +
    '- **Filtrar y ordenar** datos de forma intuitiva.\n' +
    '- **Editar en vivo** y exportar a XLSX sin complicaciones.\n\n' +
    '¿Te gustaría ver más caracteristicas?',
  ],
  options: [
    BUTTON_LABELS.VER_FEATURES,         // "Ver Video Demostrativo"
    BUTTON_LABELS.EXIT,              // "Salir"
  ],
};
