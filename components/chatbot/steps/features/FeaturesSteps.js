/****************************************************************************************
 * File: steps/features/FeaturesSteps.js
 * --------------------------------------------------------------------------------------
 * Define el submenú y los estados para las características destacadas de Talberos.
 *
 * Las opciones son:
 *   - FEATURE_1: "Licencia 100% MIT"
 *   - FEATURE_2: "Estilo Excel Real"
 *   - FEATURE_3: "Modo Oscuro y Claro"
 *   - FEATURE_4: "Arquitectura Moderna"
 ****************************************************************************************/
import { BUTTON_LABELS } from '../../common/ButtonsConfig';
import { Feature1 as Feature1Data } from './Feature1Data';
import { Feature2 as Feature2Data } from './Feature2Data';
import { Feature3 as Feature3Data } from './Feature3Data';
import { Feature4 as Feature4Data } from './Feature4Data';

export const FEATURES_MENU = {
  assistantMessages: [
    'Estas son algunas de las características destacadas de Talberos. ¿Cuál deseas conocer?\n',
  ],
  options: [
    BUTTON_LABELS.FEATURE_1,
    BUTTON_LABELS.FEATURE_2,
    BUTTON_LABELS.FEATURE_3,
    BUTTON_LABELS.FEATURE_4,
    BUTTON_LABELS.EXIT,
  ],
};

export const FEATURE_1 = {
  assistantMessages: [
    `<strong>${Feature1Data.title}</strong>\n\n` +
      `- ${Feature1Data.description}\n` +
      `${Feature1Data.details.join('\n')}`,
    '¿Deseas ver otra característica, o salir?',
  ],
  options: [
    BUTTON_LABELS.GO_FEATURES,
    BUTTON_LABELS.EXIT,
  ],
};

export const FEATURE_2 = {
  assistantMessages: [
    `<strong>${Feature2Data.title}</strong>\n\n` +
      `- ${Feature2Data.description}\n` +
      `${Feature2Data.details.join('\n')}`,
    '¿Deseas ver otra característica, o salir?',
  ],
  options: [
    BUTTON_LABELS.GO_FEATURES,
    BUTTON_LABELS.EXIT,
  ],
};

export const FEATURE_3 = {
  assistantMessages: [
    `<strong>${Feature3Data.title}</strong>\n\n` +
      `- ${Feature3Data.description}\n` +
      `${Feature3Data.details.join('\n')}`,
    '¿Deseas ver otra característica, o salir?',
  ],
  options: [
    BUTTON_LABELS.GO_FEATURES,
    BUTTON_LABELS.EXIT,
  ],
};

export const FEATURE_4 = {
  assistantMessages: [
    `<strong>${Feature4Data.title}</strong>\n\n` +
      `- ${Feature4Data.description}\n` +
      `${Feature4Data.details.join('\n')}`,
    '¿Deseas ver otra característica, o salir?',
  ],
  options: [
    BUTTON_LABELS.GO_FEATURES,
    BUTTON_LABELS.EXIT,
  ],
};
