/****************************************************************************************
 * steps/faq/FaqMenuSteps.js
 ****************************************************************************************/
import { translations } from './ChatFaqUtils';
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

const { faqSection } = translations.es;

export const FAQ_MENU = {
  assistantMessages: [
    `### ${faqSection.mainTitle}`,
    faqSection.mainSubtitle,
    'Selecciona la pregunta que desees resolver:',
  ],
  options: [
    ...faqSection.faqs.map((f) => f.question),
    BUTTON_LABELS.EXIT,  // "Salir"
  ],
};
