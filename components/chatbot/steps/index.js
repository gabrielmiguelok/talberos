/****************************************************************************************
 * File: steps/index.js
 * --------------------------------------------------------------------------------------
 * Punto de entrada para todos los estados del Chat.
 *
 * Se han realizado los siguientes ajustes:
 *  - Renombrado de estados de videos:
 *      * VIDEO_MUESTRA    => VIDEO_DEMO
 *      * VIDEO_EDI        => VIDEO_TESTIMONIO
 *      * VIDEO_MEDICOS    => VIDEO_PROSPECCION
 *  - Se actualiza el submenú de "planes" a "características destacadas":
 *      * PLANES_MENU, PLAN_A, PLAN_B, PLAN_C  => FEATURES_MENU, FEATURE_1, FEATURE_2, FEATURE_3, FEATURE_4
 ****************************************************************************************/
import { MAIN } from './menu/MainSteps';
import { MAIN_REVISITED } from './menu/MenuRevisitedSteps';

import { SABER_MAS } from './saberMas/SaberMasSteps';

// Submenú de características destacadas (anteriormente "planes")
import { FEATURES_MENU, FEATURE_1, FEATURE_2, FEATURE_3, FEATURE_4 } from './features/FeaturesSteps';

import { FAQ_MENU } from './faq/FaqMenuSteps';
import { dynamicFaqStates } from './faq/FaqDynamicSteps';

import { CONTACTO } from './contact/ContactSteps';
import { FINAL } from './final/FinalSteps';
import { DEFAULT } from './default/DefaultSteps';

export const ChatSteps = {
  MAIN,
  MAIN_REVISITED,

  SABER_MAS,

  // Estados para características destacadas
  FEATURES_MENU,
  FEATURE_1,
  FEATURE_2,
  FEATURE_3,
  FEATURE_4,

  FAQ_MENU,
  ...dynamicFaqStates,

  CONTACTO,
  FINAL,
  DEFAULT,
};
