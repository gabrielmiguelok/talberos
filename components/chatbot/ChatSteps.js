'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatSteps.js
 *
 * DESCRIPCIÓN:
 *   - Define todos los "estados" posibles del chatbot (mensajes y opciones).
 *   - Agrega estados dinámicos para FAQ (generateFAQStates).
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Separa la información estática de la lógica de transición.
 *   - DIP: `ChatFlowManager` depende de estos datos, no al revés.
 *
 * -----------------------------------------------------------------------------
 */

import { generateFAQStates, translations } from './ChatFaqUtils';

// Generación dinámica de FAQ_Qx
const dynamicFaqStates = generateFAQStates();

export const ChatSteps = {
  /* --------------------------------------------------------------------------
     MENÚ PRINCIPAL
   -------------------------------------------------------------------------- */
  MAIN: {
    assistantMessages: [
      '### Bienvenido a Chalberos 🙌',
      '¡Hemos incorporado un nuevo repositorio para el ChatBot de Preguntas Frecuentes y también puede ver su codigo en GitHub!',
    ],
    options: [
      'Quiero saber más',
      'Preguntas Frecuentes (FAQ)',
      'Ver Blogs',
      'Hablar con un asesor',
    ],
  },

  MAIN_REVISITED: {
    assistantMessages: [
      '¿En qué más puedo ayudarte? Estoy aquí para asistirte con Talberos y sus funcionalidades.',
    ],
    options: [
      'Quiero saber más',
      'Preguntas Frecuentes (FAQ)',
      'Ver Blogs',
      'Hablar con un asesor',
    ],
  },

  /* --------------------------------------------------------------------------
     SABER MÁS
   -------------------------------------------------------------------------- */
  SABER_MAS: {
    assistantMessages: [
      'Talberos es totalmente **open source** y busca acercar la experiencia de Excel a React. ¿Deseas ver un **video introductorio**, cómo se integra con **Next.js** o conocer el **modo oscuro**?',
    ],
    options: [
      'Ver video introductorio',
      'Ver integración Next.js',
      'Ver modo oscuro',
      'Salir',
    ],
  },

  /* --------------------------------------------------------------------------
     VIDEO_INTRO
   -------------------------------------------------------------------------- */
  VIDEO_INTRO: {
    assistantMessages: [
      '***\n<video src="/talberos-intro.mp4" style="width: 100%; max-width: 320px; height: auto; border-radius:8px;" controls>\n  Tu navegador no soporta video.\n</video>\n***\n\n' +
      'Aquí ves cómo Talberos emula Excel: filtrado, edición en vivo y exportación de datos. ¿Deseas ver **Blogs**, las **Preguntas Frecuentes** o hablar con un asesor?',
    ],
    options: [
      'Ver Blogs',
      'Preguntas Frecuentes (FAQ)',
      'Hablar con un asesor',
      'Salir',
    ],
  },

  /* --------------------------------------------------------------------------
     VIDEO_NEXTJS
   -------------------------------------------------------------------------- */
  VIDEO_NEXTJS: {
    assistantMessages: [
      '***\n<video src="/talberos-nextjs.mp4" style="width: 100%; max-width: 320px; height: auto; border-radius:8px;" controls>\n  Tu navegador no soporta video.\n</video>\n***\n\n' +
      'Mira cómo se integra con Next.js para aprovechar SSR y una arquitectura modular. ¿Ver Blogs, FAQ o un asesor?',
    ],
    options: [
      'Ver Blogs',
      'Preguntas Frecuentes (FAQ)',
      'Hablar con un asesor',
      'Salir',
    ],
  },

  /* --------------------------------------------------------------------------
     VIDEO_DARKMODE
   -------------------------------------------------------------------------- */
  VIDEO_DARKMODE: {
    assistantMessages: [
      '***\n<video src="/talberos-darkmode.mp4" style="width: 100%; max-width: 320px; height: auto; border-radius:8px;" controls>\n  Tu navegador no soporta video.\n</video>\n***\n\n' +
      'Talberos ofrece modo oscuro y claro, fácilmente personalizable. ¿Te gustaría ver Blogs, FAQ o hablar con un asesor?',
    ],
    options: [
      'Ver Blogs',
      'Preguntas Frecuentes (FAQ)',
      'Hablar con un asesor',
      'Salir',
    ],
  },

  /* --------------------------------------------------------------------------
     BLOGS
   -------------------------------------------------------------------------- */
  BLOGS: {
    assistantMessages: [
      '### Sección de Blogs y Artículos',
      'Desde arquitectura en React hasta manipulación masiva de datos, iremos añadiendo más posts. ¿Deseas ver las Preguntas Frecuentes o hablar con un asesor?',
    ],
    options: [
      'Preguntas Frecuentes (FAQ)',
      'Hablar con un asesor',
      'Salir',
    ],
  },

  /* --------------------------------------------------------------------------
     FAQ_MENU
   -------------------------------------------------------------------------- */
  FAQ_MENU: {
    assistantMessages: [
      `### ${translations.es.faqSection.mainTitle}`,
      translations.es.faqSection.mainSubtitle,
      'Elige una de las siguientes preguntas frecuentes:',
    ],
    options: [
      ...translations.es.faqSection.faqs.map((faq) => faq.question),
      'Salir',
    ],
  },

  // Estados FAQ generados dinámicamente (FAQ_Q0, FAQ_Q1, etc.)
  ...dynamicFaqStates,

  /* --------------------------------------------------------------------------
     CONTACTO
   -------------------------------------------------------------------------- */
  CONTACTO: {
    assistantMessages: [
      'Para un trato más personalizado, contáctanos vía [GitHub](https://github.com/gabrielmiguelok/talberos). ¡Con gusto te apoyamos!',
      '¿Deseas volver al **Menú Principal** o **finalizar** la conversación?',
    ],
    options: [
      'Menú Principal',
      'Finalizar',
    ],
  },

  /* --------------------------------------------------------------------------
     FINAL
   -------------------------------------------------------------------------- */
  FINAL: {
    assistantMessages: [
      '### ¡Gracias por usar Chalberos Chat! 🙌',
      'Si requieres más soporte, vuelve cuando desees. Estamos encantados de ayudarte.',
    ],
    options: ['Empezar de nuevo'],
  },

  /* --------------------------------------------------------------------------
     DEFAULT
   -------------------------------------------------------------------------- */
  DEFAULT: {
    assistantMessages: [
      'No he entendido tu solicitud. ¿Podrías reformularla?',
    ],
    options: ['Salir'],
  },
};
