/**************************************************************************************
 * File: common/FlowUtils.js
 * ------------------------------------------------------------------------------------
 * Contiene la función "handleCommonActions" que centraliza las acciones repetidas:
 *    - Salir, Menú Principal, FAQ, Hablar con un asesor, Finalizar, Empezar de nuevo.
 *
 * NOTA: Se ha actualizado la acción "Volver a planes" a "Volver a características"
 *       para que la lógica sea coherente con el nuevo flujo.
 **************************************************************************************/
import { BUTTON_LABELS } from './ButtonsConfig';

export function handleCommonActions({ lowerMsg, currentState, setStep, goToMenu }) {
  // "Salir" => regresa al menú principal
  if (lowerMsg.includes(BUTTON_LABELS.EXIT.toLowerCase()) || lowerMsg.includes('salir')) {
    goToMenu();
    return true;
  }

  // "Menú Principal"
  if (
    lowerMsg.includes(BUTTON_LABELS.GO_MAIN.toLowerCase()) ||
    lowerMsg.includes('menu principal')
  ) {
    goToMenu();
    return true;
  }

  // "Preguntas Frecuentes (FAQ)"
  if (
    lowerMsg.includes(BUTTON_LABELS.GO_FAQ.toLowerCase()) ||
    lowerMsg.includes('faq') ||
    lowerMsg.includes('preguntas')
  ) {
    setStep('FAQ_MENU');
    return true;
  }

  // "Hablar con un asesor"
  if (
    lowerMsg.includes(BUTTON_LABELS.GO_ADVISOR.toLowerCase()) ||
    lowerMsg.includes('asesor')
  ) {
    setStep('CONTACTO');
    return true;
  }

  // "Volver a características" (antes "Volver a planes")
  if (lowerMsg.includes(BUTTON_LABELS.GO_FEATURES.toLowerCase())) {
    setStep('FEATURES_MENU');
    return true;
  }

  // "Finalizar" => ir a estado FINAL
  if (
    lowerMsg.includes(BUTTON_LABELS.FINISH.toLowerCase()) ||
    lowerMsg.includes('finalizar')
  ) {
    setStep('FINAL');
    return true;
  }

  // "Empezar de nuevo" => ir a estado MAIN
  if (
    lowerMsg.includes(BUTTON_LABELS.RESTART.toLowerCase()) ||
    lowerMsg.includes('empezar de nuevo')
  ) {
    setStep('MAIN');
    return true;
  }

  // Si no se identificó ninguna acción, retorna false
  return false;
}
