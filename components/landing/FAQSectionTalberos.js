"use client";
/**
 * FAQSectionTalberos.js
 *
 * MIT License
 *
 * Sección de Preguntas Frecuentes (FAQs) para Talberos, una librería MIT
 * que facilita la creación de tablas estilo Excel en React.
 *
 * PRINCIPIOS BÁSICOS (SOLID + CLEAN CODE):
 *  - SRP (Single Responsibility Principle):
 *      Cada subcomponente (título, lista de ítems, ítem individual)
 *      maneja su única responsabilidad. Los estilos se encapsulan en constantes.
 *  - OCP (Open/Closed Principle):
 *      Podemos agregar más FAQs sin tocar la lógica base,
 *      o modificar fácilmente la apariencia cambiando las constantes.
 *  - LSP / ISP / DIP:
 *      No se hereda ni se fuerzan dependencias. Cada parte se compone de forma independiente.
 *  - CLEAN CODE:
 *      Variables claras, nombres descriptivos y comentarios explicativos
 *      para facilitar la mantenibilidad y extensibilidad.
 *
 * DESCRIPCIÓN:
 *  - Usa Framer Motion y MUI para animaciones y diseño.
 *  - Facilita personalizaciones de alturas y márgenes sin alterar la lógica,
 *    gracias a las constantes definidas al inicio.
 *  - Evita dependencias que rompan SSR en Next.js.
 *
 * USO:
 *  - Importa y renderiza <FAQSectionTalberos /> en tu Landing Page
 *    o donde desees mostrar las preguntas frecuentes.
 */

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Framer Motion para animaciones
import { motion } from 'framer-motion';

/* -------------------------------------------------------------------------
   1) CONSTANTES DE DISEÑO Y CONFIGURACIÓN
   ------------------------------------------------------------------------- */

/** Colores principales y de fondo */
const COLOR_PRINCIPAL = '#FF00AA';
const COLOR_FONDO_GRADIENT = 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)';
const COLOR_FONDO_ACCORDION = '#242424';
const COLOR_FONDO_ACCORDION_DETAILS = '#1F1F1F';

/** Colores de texto */
const COLOR_TEXTO_BASE = '#fff';
const COLOR_TEXTO_ACLARACION = '#ddd';

/** Dimensiones y espaciamientos principales */
const SECTION_PADDING_Y = { xs: 6, sm: 8 };
const SECTION_PADDING_X = { xs: 2, md: 6 };
const MAX_WIDTH_CONTAINER = 'lg';

/** Ajustes para las burbujas decorativas */
const BUBBLE_OPACITY_LARGE = 0.1;
const BUBBLE_OPACITY_SMALL = 0.08;
const BUBBLE_SIZE_LARGE = 300;
const BUBBLE_SIZE_SMALL = 250;

/**
 * Ajustes de Accordion para controlar alturas y espaciados:
 * - ACCORDION_SUMMARY_PADDING: Ajusta el padding interno del título del FAQ
 * - ACCORDION_DETAILS_PADDING: Ajusta el padding de la sección de respuesta
 * - ACCORDION_ITEM_MARGIN_BOTTOM: Espacio inferior de cada ítem
 * - ACCORDION_ITEM_MIN_HEIGHT: Altura mínima (forzada) en el Accordion
 *
 * NOTA: Para forzar que el AccordionSummary baje de ~48px,
 *       se debe sobrescribir la clase .MuiAccordionSummary-root.
 */
const ACCORDION_SUMMARY_PADDING = 1;
const ACCORDION_DETAILS_PADDING = 2;
const ACCORDION_ITEM_MARGIN_BOTTOM = 2;
const ACCORDION_ITEM_MIN_HEIGHT = '40px';
  // Ajusta aquí. Ten en cuenta que si el contenido
  // supera esta altura, no se hará más pequeño.

/* -------------------------------------------------------------------------
   2) LISTADO DE PREGUNTAS FRECUENTES
   ------------------------------------------------------------------------- */
const faqItems = [
  {
    question: '¿Qué es Talberos?',
    answer:
      'Talberos es una librería de código abierto (MIT) para React que permite crear tablas estilo Excel con ' +
      'filtrado, ordenamiento, edición en vivo y exportación a XLSX. Ofrece una experiencia muy cercana a Excel ' +
      'sin costos de licencia ni limitaciones.',
  },
  {
    question: '¿Cómo se instala y utiliza Talberos?',
    answer:
      'La manera más sencilla es clonar el repositorio oficial en GitHub y seguir la documentación. ' +
      'Allí hallarás ejemplos, buenas prácticas y guías de integración en React/Next.js.',
  },
  {
    question: '¿Puedo usar Talberos en proyectos comerciales?',
    answer:
      'Sí. Al ser MIT, puedes usarlo libremente incluso en proyectos comerciales, sin restricciones ni licencias adicionales.',
  },
  {
    question: '¿Soporta modo oscuro y personalización?',
    answer:
      'Así es. Trae un modo oscuro integrado y la posibilidad de alternar a modo claro. ' +
      'Además, puedes ajustar colores, tipografías y el comportamiento de la tabla para alinearlo a tu branding.',
  },
  {
    question: '¿Incluye filtrado avanzado y edición de celdas?',
    answer:
      'Talberos ofrece filtros por columna, filtro global, ordenamiento y edición en línea de celdas. ' +
      'Se basa en hooks especializados, manteniendo un diseño limpio y escalable.',
  },
  {
    question: '¿Cómo se maneja la exportación a Excel?',
    answer:
      'La librería incorpora exportación a XLSX mediante la librería xlsx, facilitando la generación de archivos ' +
      'para compartir con tu equipo o clientes.',
  },
  {
    question: '¿Qué hay sobre la seguridad y la escalabilidad?',
    answer:
      'Talberos se enfoca en la capa frontend. Sin embargo, sigue principios SOLID y es altamente modular, ' +
      'permitiendo integraciones seguras con cualquier backend (REST, GraphQL, etc.). ' +
      'Soporta grandes volúmenes de datos usando paginación y filtrado eficiente.',
  },
  {
    question: '¿Cómo colaborar o aportar al proyecto?',
    answer:
      'El proyecto está en GitHub. Puedes abrir issues, sugerir mejoras con pull requests o contribuir con ejemplos. ' +
      'Se fomenta una comunidad colaborativa donde todos aprendemos.',
  },
];

/* -------------------------------------------------------------------------
   3) VARIANTS DE FRAMER MOTION (ANIMACIONES)
   ------------------------------------------------------------------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const containerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/* -------------------------------------------------------------------------
   4) SUBCOMPONENTE: FAQSectionTitle
   ------------------------------------------------------------------------- */
/**
 * @function FAQSectionTitle
 * @description Muestra el título y descripción de la sección de FAQs.
 *              Ajusta tamaño y márgenes según el breakpoint (isMobile).
 */
function FAQSectionTitle() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 6, sm: 8 } }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h2"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            fontSize: isMobile ? '2.3rem' : '2.7rem',
            color: COLOR_PRINCIPAL,
          }}
        >
          Preguntas Frecuentes
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            mt: 2,
            color: COLOR_TEXTO_ACLARACION,
            maxWidth: '700px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.6,
          }}
        >
          ¿Dudas sobre Talberos? Aquí encontrarás las respuestas más comunes
          para comprender la potencia de esta librería.
        </Typography>
      </motion.div>
    </Box>
  );
}

/* -------------------------------------------------------------------------
   5) SUBCOMPONENTE: FAQItem
   ------------------------------------------------------------------------- */
/**
 * @function FAQItem
 * @description Renderiza un ítem de FAQ con un Accordion animado y estilos
 *              ajustables mediante constantes (paddings, alturas mínimas, etc.).
 *
 * @param {Object} props
 * @param {string} props.question - Pregunta a mostrar.
 * @param {string} props.answer - Respuesta correspondiente.
 * @param {number} [props.delay=0] - Retardo para la animación escalonada.
 */
function FAQItem({ question, answer, delay = 0 }) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Accordion
        sx={{
          backgroundColor: COLOR_FONDO_ACCORDION,
          color: COLOR_TEXTO_BASE,
          borderRadius: 2,
          border: '1px solid #2F2F2F',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          mb: ACCORDION_ITEM_MARGIN_BOTTOM,
          // Forzamos la altura mínima en el Accordion:
          minHeight: 'unset',  // Aseguramos que no use la minHeight interna
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          },
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: COLOR_PRINCIPAL }} />}
          aria-controls={`faq-content-${question}`}
          id={`faq-header-${question}`}
          sx={{
            p: ACCORDION_SUMMARY_PADDING,
            // Sobrescribimos el minHeight por defecto de MUI:
            '&.MuiAccordionSummary-root': {
              minHeight: ACCORDION_ITEM_MIN_HEIGHT,
            },
            // Ajustamos la distribución del contenido interno:
            '& .MuiAccordionSummary-content': {
              margin: 0, // elimina margen interno
            },
          }}
        >
          <CheckCircleIcon sx={{ mr: 1, color: COLOR_PRINCIPAL, fontSize: 20 }} />
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.95rem', // Para hacerlo aún más compacto
            }}
          >
            {question}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            backgroundColor: COLOR_FONDO_ACCORDION_DETAILS,
            p: ACCORDION_DETAILS_PADDING,
          }}
        >
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: COLOR_TEXTO_ACLARACION,
              whiteSpace: 'pre-line',
              fontSize: '0.9rem', // Más pequeño = más compacto
              lineHeight: 1.4,
            }}
          >
            {answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
   6) SUBCOMPONENTE: FAQList
   ------------------------------------------------------------------------- */
/**
 * @function FAQList
 * @description Renderiza la lista de preguntas, aplicando animaciones escalonadas
 *              para cada FAQItem.
 */
function FAQList() {
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ width: '100%' }}
    >
      <Grid container spacing={3}>
        {faqItems.map((faq, index) => (
          <Grid item xs={12} key={faq.question}>
            <FAQItem question={faq.question} answer={faq.answer} delay={index * 0.1} />
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
   7) COMPONENTE PRINCIPAL: FAQSectionTalberos
   ------------------------------------------------------------------------- */
/**
 * @function FAQSectionTalberos
 * @description Sección principal de Preguntas Frecuentes de Talberos.
 *              Integra el título, listado de FAQs y elementos decorativos.
 *              Todas las variables importantes (colores, tamaños, etc.) se definen
 *              al inicio para facilitar su modificación sin romper la lógica.
 *
 * @returns {JSX.Element} Sección FAQ lista para usar en tu Landing Page.
 */
export default function FAQSectionTalberos() {
  return (
    <Box
      component="section"
      id="faq-section-talberos"
      aria-label="Preguntas Frecuentes de Talberos"
      sx={{
        width: '100%',
        overflow: 'hidden',
        py: SECTION_PADDING_Y,
        px: SECTION_PADDING_X,
        background: COLOR_FONDO_GRADIENT,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Burbuja decorativa grande */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: BUBBLE_OPACITY_LARGE }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: `${BUBBLE_SIZE_LARGE}px`,
          height: `${BUBBLE_SIZE_LARGE}px`,
          background: `radial-gradient(circle, ${COLOR_PRINCIPAL} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Burbuja decorativa pequeña */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: BUBBLE_OPACITY_SMALL }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: `${BUBBLE_SIZE_SMALL}px`,
          height: `${BUBBLE_SIZE_SMALL}px`,
          background: `radial-gradient(circle, ${COLOR_PRINCIPAL} 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <Container maxWidth={MAX_WIDTH_CONTAINER} sx={{ position: 'relative', zIndex: 2 }}>
        {/* Título de la sección */}
        <FAQSectionTitle />

        {/* Lista de preguntas frecuentes */}
        <FAQList />
      </Container>
    </Box>
  );
}
