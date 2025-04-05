/****************************************************************************************
 * steps/faq/ChatFaqUtils.js
 ****************************************************************************************/
export const translations = {
  es: {
    faqSection: {
      mainTitle: 'Preguntas Frecuentes',
      mainSubtitle:
        '¿Dudas sobre Talberos? Aquí encontrarás las respuestas más comunes para comprender la potencia de esta librería.',
      faqs: [
        {
          question: '¿Qué es Talberos?',
          answer:
            'Talberos es una librería de código abierto (MIT) para React que permite crear tablas estilo Excel con filtrado, ordenamiento, edición en vivo y exportación a XLSX. Ofrece una experiencia muy cercana a Excel sin costos de licencia ni limitaciones.',
        },
        {
          question: '¿Cómo se instala y utiliza Talberos?',
          answer:
            'La manera más sencilla es clonar el repositorio oficial en GitHub y seguir la documentación. Allí hallarás ejemplos, buenas prácticas y guías de integración en React/Next.js.',
        },
        {
          question: '¿Puedo usar Talberos en proyectos comerciales?',
          answer:
            'Sí. Al ser MIT, puedes usarlo libremente incluso en proyectos comerciales, sin restricciones ni licencias adicionales.',
        },
        {
          question: '¿Soporta modo oscuro y personalización?',
          answer:
            'Así es. Trae un modo oscuro integrado y la posibilidad de alternar a modo claro. Además, puedes ajustar colores, tipografías y el comportamiento de la tabla para alinearlo a tu branding.',
        },
        {
          question: '¿Incluye filtrado avanzado y edición de celdas?',
          answer:
            'Talberos ofrece filtros por columna, filtro global, ordenamiento y edición en línea de celdas. Se basa en hooks especializados, manteniendo un diseño limpio y escalable.',
        },
        {
          question: '¿Cómo se maneja la exportación a Excel?',
          answer:
            'La librería incorpora exportación a XLSX mediante la librería xlsx, facilitando la generación de archivos para compartir con tu equipo o clientes.',
        },
        {
          question: '¿Qué hay sobre la seguridad y la escalabilidad?',
          answer:
            'Talberos se enfoca en la capa frontend. Sin embargo, sigue principios SOLID y es altamente modular, permitiendo integraciones seguras con cualquier backend (REST, GraphQL, etc.). Soporta grandes volúmenes de datos usando paginación y filtrado eficiente.',
        },
        {
          question: '¿Cómo colaborar o aportar al proyecto?',
          answer:
            'El proyecto está en GitHub. Puedes abrir issues, sugerir mejoras con pull requests o contribuir con ejemplos. Se fomenta una comunidad colaborativa donde todos aprendemos.',
        },
      ],
    },
  },
};
