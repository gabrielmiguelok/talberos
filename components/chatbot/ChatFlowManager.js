'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatFlowManager.js
 *
 * DESCRIPCIÓN:
 *   - Orquesta el estado conversacional: recibe estado actual y mensaje del usuario,
 *     decide la transición (nuevo estado) y retorna los mensajes del asistente y opciones.
 *   - Trabaja junto a `ChatSteps` para definir la lógica de cada nodo/estado.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Separa la responsabilidad de transición de estados de la UI o de la data.
 *   - DIP: Depende de ChatSteps para obtener la información y no al revés.
 *
 * -----------------------------------------------------------------------------
 */

import { ChatSteps } from './ChatSteps';

export function ChatFlowManager(currentState, userMessage) {
  const textLower = userMessage.toLowerCase().trim();
  let newState = currentState;
  let stepData = ChatSteps.DEFAULT;

  // Helper para cambiar de estado
  const setStep = (key) => {
    newState = key;
    stepData = ChatSteps[key] || ChatSteps.DEFAULT;
  };

  // Volver al menú principal
  const goToMenu = () => {
    if (currentState === 'MAIN') {
      // Si ya estamos en MAIN, nos mantenemos
      setStep('MAIN');
    } else {
      setStep('MAIN_REVISITED');
    }
  };

  // Volver al FAQ
  const goToFAQ = () => {
    setStep('FAQ_MENU');
  };

  let handled = true;

  /* --------------------------------------------------------------------------
     1) ESTADOS PRINCIPALES
  -------------------------------------------------------------------------- */
  switch (currentState) {
    case 'MAIN':
    case 'MAIN_REVISITED':
      if (/saber más|saber mas/.test(textLower)) {
        setStep('SABER_MAS');
      } else if (/faq|preguntas/.test(textLower)) {
        setStep('FAQ_MENU');
      } else if (/blog|blogs/.test(textLower)) {
        setStep('BLOGS');
      } else if (/asesor|contacto/.test(textLower)) {
        setStep('CONTACTO');
      } else {
        handled = false;
      }
      break;

    /* --------------------------------------------------------------------------
       2) SABER MÁS
    -------------------------------------------------------------------------- */
    case 'SABER_MAS':
      if (/video introductorio|intro/.test(textLower)) {
        setStep('VIDEO_INTRO');
      } else if (/next(\.js)?/.test(textLower)) {
        setStep('VIDEO_NEXTJS');
      } else if (/oscuro|darkmode/.test(textLower)) {
        setStep('VIDEO_DARKMODE');
      } else if (/salir|menu principal|menú principal/.test(textLower)) {
        goToMenu();
      } else {
        handled = false;
      }
      break;

    /* --------------------------------------------------------------------------
       3) VIDEOS: INTRO, NEXTJS, DARKMODE
    -------------------------------------------------------------------------- */
    case 'VIDEO_INTRO':
    case 'VIDEO_NEXTJS':
    case 'VIDEO_DARKMODE':
      if (/blog|blogs/.test(textLower)) {
        setStep('BLOGS');
      } else if (/faq|preguntas/.test(textLower)) {
        setStep('FAQ_MENU');
      } else if (/asesor|contacto/.test(textLower)) {
        setStep('CONTACTO');
      } else if (/salir|menu principal|menú principal/.test(textLower)) {
        goToMenu();
      } else {
        handled = false;
      }
      break;

    /* --------------------------------------------------------------------------
       4) BLOGS
    -------------------------------------------------------------------------- */
    case 'BLOGS':
      if (/asesor|contacto/.test(textLower)) {
        setStep('CONTACTO');
      } else if (/faq|preguntas/.test(textLower)) {
        setStep('FAQ_MENU');
      } else if (/salir|menu principal|menú principal/.test(textLower)) {
        goToMenu();
      } else {
        handled = false;
      }
      break;

    /* --------------------------------------------------------------------------
       5) FAQ
    -------------------------------------------------------------------------- */
    case 'FAQ_MENU': {
      // Se evalúan las preguntas listadas en ChatSteps.FAQ_MENU.options
      const faqOptions = ChatSteps.FAQ_MENU.options || [];
      let matchedIndex = -1;

      faqOptions.forEach((option, idx) => {
        // Evitamos 'Salir' en la comparación
        if (option.toLowerCase().includes('salir')) return;
        if (
          option.toLowerCase().includes('volver a') ||
          option.toLowerCase().includes('principal')
        ) return;

        // Sólo si es una pregunta real
        if (textLower.includes(option.toLowerCase().slice(0, 8))) {
          matchedIndex = idx;
        }
      });

      if (matchedIndex >= 0) {
        setStep(`FAQ_Q${matchedIndex}`);
      } else if (/salir|menu principal|menú principal/.test(textLower)) {
        goToMenu();
      } else {
        handled = false;
      }
      break;
    }

    /* --------------------------------------------------------------------------
       6) ESTADOS FAQ (FAQ_Qx generados dinámicamente)
    -------------------------------------------------------------------------- */
    default:
      if (currentState.startsWith('FAQ_Q')) {
        // En cada pregunta, se puede volver a las FAQ o al Menú principal
        if (/preguntas frecuentes|faq|ver otras|más preguntas/.test(textLower)) {
          goToFAQ();
        } else if (/menú principal|menu principal|salir|inicio/.test(textLower)) {
          goToMenu();
        } else {
          handled = false;
        }
        break;
      }

      /* ------------------------------------------------------------------------
         7) CONTACTO
      ------------------------------------------------------------------------ */
      if (currentState === 'CONTACTO') {
        if (/menú principal|menu principal/.test(textLower)) {
          goToMenu();
        } else if (/finalizar/.test(textLower)) {
          setStep('FINAL');
        } else {
          handled = false;
        }
        break;
      }

      /* ------------------------------------------------------------------------
         8) FINAL
      ------------------------------------------------------------------------ */
      if (currentState === 'FINAL') {
        if (/empezar de nuevo|reiniciar/.test(textLower)) {
          setStep('MAIN');
        } else {
          handled = false;
        }
        break;
      }

      handled = false;
      break;
  }

  /* --------------------------------------------------------------------------
     9) RETORNO
  -------------------------------------------------------------------------- */
  if (handled && newState !== 'DEFAULT') {
    return {
      newState,
      assistantMessages: stepData.assistantMessages,
      newOptions: stepData.options,
    };
  }

  // Fallback: no manejado => DEFAULT
  return {
    newState: 'DEFAULT',
    assistantMessages: ChatSteps.DEFAULT.assistantMessages,
    newOptions: ChatSteps.DEFAULT.options,
  };
}
