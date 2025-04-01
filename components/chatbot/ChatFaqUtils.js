'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatFaqUtils.js
 *
 * DESCRIPCIÓN:
 *   - Contiene la definición de Preguntas Frecuentes y sus respuestas.
 *   - Proporciona una función que crea estados FAQ_Qx para integrarlos en ChatSteps.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Define la información de las FAQ; no controla la UI ni la transición de estados.
 *   - OCP: Agregar/quitar FAQs sin romper lógica (generateFAQStates se adapta).
 *
 * -----------------------------------------------------------------------------
 */

export const translations = {
  es: {
    faqSection: {
      mainTitle: 'Preguntas Frecuentes',
      mainSubtitle:
        'Descubre cómo funciona Talberos y resuelve dudas comunes sobre la librería y sus ventajas.',
      faqs: [
        {
          question: '¿Qué es Talberos?',
          answer:
            'Talberos es una librería open source (MIT) que brinda tablas estilo Excel en React, con filtrado, ordenamiento, edición en vivo y exportación a XLSX, emulando una hoja de cálculo real sin costos de licencia.',
        },
        {
          question: '¿Cómo se instala y utiliza?',
          answer:
            'La forma más directa es clonar el repositorio en GitHub. Encontrarás ejemplos, guías y principios SOLID. Luego, configura tus columnas, filtros y edición de celdas según tus necesidades.',
        },
        {
          question: '¿Puedo usarlo en proyectos comerciales?',
          answer:
            'Sí. Al estar bajo licencia MIT, Talberos se puede usar y modificar en todo tipo de proyectos, sin restricciones.',
        },
        {
          question: '¿Permite modo oscuro y personalización?',
          answer:
            'Incluye modo oscuro y un modo claro, personalizables con variables CSS. Además, puedes adaptar colores y tipografías para mantener la identidad de tu marca.',
        },
        {
          question: '¿Filtrado avanzado y edición de celdas?',
          answer:
            'Sí. Está diseñado con hooks como useCellSelection y useInlineCellEdit para mantener un código limpio y facilitar el filtrado, ordenamiento y edición en tiempo real.',
        },
        {
          question: '¿Cómo exporto a Excel?',
          answer:
            'Incorpora la librería "xlsx" para ofrecer exportación de la tabla a archivos .xlsx con un clic, ideal para reportes e intercambio de datos.',
        },
        {
          question: '¿Qué tan escalable es?',
          answer:
            'Su arquitectura modular soporta grandes volúmenes de datos con paginación y filtrado eficiente. Se integra con cualquier backend (REST, GraphQL, etc.).',
        },
        {
          question: '¿Cómo colaborar con el proyecto?',
          answer:
            'Puedes abrir issues y pull requests en GitHub. La comunidad está invitada a aportar mejoras, ejemplos o documentación. ¡Toda colaboración es bienvenida!',
        },
      ],
    },
  },
};

/**
 * Genera estados FAQ_Q0, FAQ_Q1, etc. a partir de las FAQs definidas arriba.
 * Cada estado muestra la respuesta y ofrece opciones para regresar a las preguntas
 * frecuentes o al menú principal.
 */
export function generateFAQStates() {
  const { faqs } = translations.es.faqSection;
  const states = {};

  faqs.forEach((faq, i) => {
    const stateKey = `FAQ_Q${i}`;
    states[stateKey] = {
      assistantMessages: [
        `**${faq.question}**\n\n${faq.answer}`,
      ],
      options: [
        'Ver otras preguntas',
        'Menú Principal',
      ],
    };
  });

  return states;
}
