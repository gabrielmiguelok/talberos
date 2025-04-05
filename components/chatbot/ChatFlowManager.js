/****************************************************************************************
 * File: ChatFlowManager.js
 * --------------------------------------------------------------------------------------
 * Lógica central del Chat sin referencias a "demo" ni videos.
 ****************************************************************************************/
import { ChatSteps } from './steps';
import { handleCommonActions } from './common/FlowUtils';
import { BUTTON_LABELS } from './common/ButtonsConfig';

export function ChatFlowManager(currentState, userMessage) {
  const lowerMsg = userMessage.toLowerCase().trim();
  let newState = currentState;
  let stepData = ChatSteps.DEFAULT;

  // Helper para actualizar el estado actual
  const setStep = (key) => {
    newState = key;
    stepData = ChatSteps[key];
  };

  // Helper para regresar al menú principal
  const goToMenu = () => {
    if (currentState === 'MAIN') {
      setStep('MAIN');
    } else {
      setStep('MAIN_REVISITED');
    }
  };

  // 1) Acciones comunes (Salir, FAQ, etc.)
  const alreadyHandled = handleCommonActions({ lowerMsg, currentState, setStep, goToMenu });
  if (alreadyHandled) {
    return finalizeState(newState, stepData);
  }

  // 2) Lógica específica por estado
  let handled = true;

  switch (currentState) {
    // --- MENÚ PRINCIPAL ---
    case 'MAIN':
    case 'MAIN_REVISITED': {
      // "Saber más"
      if (lowerMsg.includes('saber más') || lowerMsg.includes('saber mas')) {
        setStep('SABER_MAS');
      }
      // "Características"
      else if (lowerMsg.includes('caracteristicas') || lowerMsg.includes('características')) {
        setStep('FEATURES_MENU');
      } else {
        handled = false;
      }
      break;
    }

    // --- SABER_MAS ---
    case 'SABER_MAS': {
      // Si el usuario menciona "características"
      if (lowerMsg.includes('caracteristicas') || lowerMsg.includes('características')) {
        setStep('FEATURES_MENU');
      } else {
        handled = false;
      }
      break;
    }

    // --- SUBMENÚ DE CARACTERÍSTICAS ---
    case 'FEATURES_MENU': {
      if (lowerMsg.includes(BUTTON_LABELS.FEATURE_1.toLowerCase())) {
        setStep('FEATURE_1');
      } else if (lowerMsg.includes(BUTTON_LABELS.FEATURE_2.toLowerCase())) {
        setStep('FEATURE_2');
      } else if (lowerMsg.includes(BUTTON_LABELS.FEATURE_3.toLowerCase())) {
        setStep('FEATURE_3');
      } else if (lowerMsg.includes(BUTTON_LABELS.FEATURE_4.toLowerCase())) {
        setStep('FEATURE_4');
      } else {
        handled = false;
      }
      break;
    }

    // --- DETALLE DE CARACTERÍSTICAS ---
    case 'FEATURE_1':
    case 'FEATURE_2':
    case 'FEATURE_3':
    case 'FEATURE_4': {
      // Se gestionan en handleCommonActions (Salir, FAQ, etc.)
      handled = false;
      break;
    }

    // --- FAQ MENÚ ---
    case 'FAQ_MENU': {
      const faqOptions = ChatSteps.FAQ_MENU.options || [];
      const matchIndex = faqOptions.findIndex(
        (q) => q !== 'Salir' && lowerMsg.includes(q.toLowerCase().slice(0, 10))
      );
      if (matchIndex !== -1) {
        setStep(`FAQ_Q${matchIndex}`);
      } else {
        handled = false;
      }
      break;
    }

    // --- CONTACTO ---
    case 'CONTACTO': {
      handled = false;
      break;
    }

    // --- FINAL ---
    case 'FINAL': {
      handled = false;
      break;
    }

    default: {
      // Estados FAQ_Qx u otros no contemplados aquí
      handled = false;
      break;
    }
  }

  // 3) Si no se manejó nada, se va a DEFAULT
  if (!handled) {
    if (newState === currentState) {
      newState = 'DEFAULT';
      stepData = ChatSteps.DEFAULT;
    }
  }

  return finalizeState(newState, stepData);
}

function finalizeState(newState, stepData) {
  return {
    newState,
    assistantMessages: stepData.assistantMessages,
    newOptions: stepData.options,
  };
}
