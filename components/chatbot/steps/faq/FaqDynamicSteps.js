/****************************************************************************************
 * steps/faq/FaqDynamicSteps.js
 ****************************************************************************************/
import { translations } from './ChatFaqUtils';
import { BUTTON_LABELS } from '../../common/ButtonsConfig';

const { faqs } = translations.es.faqSection;

/**
 * Generamos un objeto con keys FAQ_Q0, FAQ_Q1, etc.
 * Cada uno tiene el "answer" correspondiente.
 */
const map = {};
faqs.forEach((faq, i) => {
  const key = `FAQ_Q${i}`;
  map[key] = {
    assistantMessages: [
      `**${faq.question}**\n\n${faq.answer}`,
    ],
    options: [
      BUTTON_LABELS.EXIT  // "Salir"
    ],
  };
});

export const dynamicFaqStates = map;
