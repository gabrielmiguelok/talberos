"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/FAQSectionTalberos.js
 *
 * DESCRIPCIÓN:
 *   - Sección de Preguntas Frecuentes (FAQs) para Talberos.
 *   - Refactorizada para usar la misma paleta de colores y estilo
 *     que el Hero y UniqueDifferentiator.
 *   - Se definen constantes de configuración (colores, tipografías,
 *     gradientes, etc.) en formato hexadecimal #rrggbb.
 *
 * PRINCIPIOS SOLID + CLEAN CODE:
 *   - SRP: Cada subcomponente maneja su responsabilidad (título, lista, ítem).
 *   - OCP: Se pueden agregar FAQs o modificar estilo sin cambiar la lógica.
 *   - LSP/ISP/DIP: Cada parte está compuesta independientemente,
 *     sin dependencias forzadas.
 *   - CLEAN CODE: Nombres claros y semánticos, uso de comentarios descriptivos.
 *
 * LICENCIA:
 *   - Bajo licencia MIT, para fines educativos y demostrativos.
 */

import React from "react";
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
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Framer Motion
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------
   1) CONSTANTES DE PALETA (Misma que en Hero/UniqueDifferentiator)
   ------------------------------------------------------------------------- */
const FAQ_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
const FAQ_TEXT_COLOR = "#000000";
const FAQ_HEADING_COLOR = "#0d47a1";
const FAQ_DESCRIPTION_COLOR = "#000000";
const FAQ_CARD_BG = "#FFFFFF";

/**
 * Color destacado para efectos (burbujas, íconos expand, etc.).
 * Se emplea el mismo "#0d47a1" (FAQ_HEADING_COLOR) o puedes
 * definir un secundario si prefieres distinguirlo.
 */
const FAQ_HIGHLIGHT_COLOR = FAQ_HEADING_COLOR;

/* -------------------------------------------------------------------------
   2) CONSTANTES PARA SECCIÓN PRINCIPAL (espaciamientos, contenedor, etc.)
   ------------------------------------------------------------------------- */
const SECTION_PADDING_Y = { xs: 6, sm: 8 };
const SECTION_PADDING_X = { xs: 2, md: 6 };
const MAX_WIDTH_CONTAINER = "lg";

/**
 * Burbujas decorativas: tamaño y opacidad
 */
const BUBBLE_SIZE_LARGE = 300;
const BUBBLE_SIZE_SMALL = 250;
const BUBBLE_OPACITY_LARGE = 0.1;
const BUBBLE_OPACITY_SMALL = 0.08;

/* -------------------------------------------------------------------------
   3) CONSTANTES PARA TÍTULO Y DESCRIPCIÓN DE FAQ
   ------------------------------------------------------------------------- */
const FAQ_TITLE_FONT_SIZE_MOBILE = "2.3rem";
const FAQ_TITLE_FONT_SIZE_DESKTOP = "2.7rem";
const FAQ_TITLE_FONT_WEIGHT = "bold";

const FAQ_DESC_COLOR = "#000000"; // Si quieres un gris suave distinto
const FAQ_DESC_FONT_SIZE_MOBILE = "1rem";
const FAQ_DESC_FONT_SIZE_DESKTOP = "1.1rem";
const FAQ_DESC_LINE_HEIGHT = 1.6;
const FAQ_DESC_MAX_WIDTH = "700px";

/* -------------------------------------------------------------------------
   4) CONSTANTES PARA FAQ LIST & ITEMS
   ------------------------------------------------------------------------- */
/**
 * Accordion / FAQItem
 */
const FAQ_ACCORDION_BG = FAQ_CARD_BG; // Fondo del Accordion
const FAQ_ACCORDION_DETAILS_BG = "#f9f9f9"; // Contraste suave para detalles

const ACCORDION_BORDER_RADIUS = 2;
const ACCORDION_BOX_SHADOW = "0 4px 8px rgba(0,0,0,0.2)";
const ACCORDION_BOX_SHADOW_HOVER = "0 6px 16px rgba(0,0,0,0.3)";
const ACCORDION_BORDER = "1px solid #E0E0E0";

const ACCORDION_ITEM_MARGIN_BOTTOM = 2;
const ACCORDION_ITEM_MIN_HEIGHT = "40px";
const ACCORDION_SUMMARY_PADDING = 1;
const ACCORDION_DETAILS_PADDING = 2;

/**
 * Tipografías del FAQItem
 */
const FAQ_ITEM_QUESTION_FONT_SIZE = "0.95rem";
const FAQ_ITEM_QUESTION_FONT_WEIGHT = "bold";

const FAQ_ITEM_ANSWER_FONT_SIZE = "0.9rem";
const FAQ_ITEM_ANSWER_LINE_HEIGHT = 1.4;
const FAQ_ITEM_ANSWER_COLOR = "#000000"; // Gris oscuro (opcional)

/* -------------------------------------------------------------------------
   5) VARIANTS DE FRAMER MOTION (animaciones)
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
   6) LISTADO DE PREGUNTAS FRECUENTES
   ------------------------------------------------------------------------- */
const faqItems = [
  {
    question: "¿Qué es Talberos?",
    answer:
      "Talberos es una librería de código abierto (MIT) para React que permite crear tablas estilo Excel con " +
      "filtrado, ordenamiento, edición en vivo y exportación a XLSX. Ofrece una experiencia muy cercana a Excel " +
      "sin costos de licencia ni limitaciones.",
  },
  {
    question: "¿Cómo se instala y utiliza Talberos?",
    answer:
      "La manera más sencilla es clonar el repositorio oficial en GitHub y seguir la documentación. " +
      "Allí hallarás ejemplos, buenas prácticas y guías de integración en React/Next.js.",
  },
  {
    question: "¿Puedo usar Talberos en proyectos comerciales?",
    answer:
      "Sí. Al ser MIT, puedes usarlo libremente incluso en proyectos comerciales, sin restricciones ni licencias adicionales.",
  },
  {
    question: "¿Soporta modo oscuro y personalización?",
    answer:
      "Así es. Trae un modo oscuro integrado y la posibilidad de alternar a modo claro. " +
      "Además, puedes ajustar colores, tipografías y el comportamiento de la tabla para alinearlo a tu branding.",
  },
  {
    question: "¿Incluye filtrado avanzado y edición de celdas?",
    answer:
      "Talberos ofrece filtros por columna, filtro global, ordenamiento y edición en línea de celdas. " +
      "Se basa en hooks especializados, manteniendo un diseño limpio y escalable.",
  },
  {
    question: "¿Cómo se maneja la exportación a Excel?",
    answer:
      "La librería incorpora exportación a XLSX mediante la librería xlsx, facilitando la generación de archivos " +
      "para compartir con tu equipo o clientes.",
  },
  {
    question: "¿Qué hay sobre la seguridad y la escalabilidad?",
    answer:
      "Talberos se enfoca en la capa frontend. Sin embargo, sigue principios SOLID y es altamente modular, " +
      "permitiendo integraciones seguras con cualquier backend (REST, GraphQL, etc.). " +
      "Soporta grandes volúmenes de datos usando paginación y filtrado eficiente.",
  },
  {
    question: "¿Cómo colaborar o aportar al proyecto?",
    answer:
      "El proyecto está en GitHub. Puedes abrir issues, sugerir mejoras con pull requests o contribuir con ejemplos. " +
      "Se fomenta una comunidad colaborativa donde todos aprendemos.",
  },
];

/* -------------------------------------------------------------------------
   7) SUBCOMPONENTE: FAQSectionTitle
   ------------------------------------------------------------------------- */
function FAQSectionTitle() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ textAlign: "center", mb: { xs: 6, sm: 8 } }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
      >
        <Typography
          component="h2"
          sx={{
            fontWeight: FAQ_TITLE_FONT_WEIGHT,
            mb: 3,
            fontSize: isMobile
              ? FAQ_TITLE_FONT_SIZE_MOBILE
              : FAQ_TITLE_FONT_SIZE_DESKTOP,
            color: FAQ_HEADING_COLOR,
          }}
        >
          Preguntas Frecuentes
        </Typography>

        <Typography
          component="p"
          sx={{
            mt: 2,
            color: FAQ_DESC_COLOR,
            maxWidth: FAQ_DESC_MAX_WIDTH,
            mx: "auto",
            fontSize: {
              xs: FAQ_DESC_FONT_SIZE_MOBILE,
              sm: FAQ_DESC_FONT_SIZE_DESKTOP,
            },
            lineHeight: FAQ_DESC_LINE_HEIGHT,
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
   8) SUBCOMPONENTE: FAQItem
   ------------------------------------------------------------------------- */
function FAQItem({ question, answer, delay = 0 }) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Accordion
        sx={{
          backgroundColor: FAQ_ACCORDION_BG,
          color: FAQ_TEXT_COLOR,
          borderRadius: ACCORDION_BORDER_RADIUS,
          border: ACCORDION_BORDER,
          boxShadow: ACCORDION_BOX_SHADOW,
          mb: ACCORDION_ITEM_MARGIN_BOTTOM,
          "&:hover": {
            boxShadow: ACCORDION_BOX_SHADOW_HOVER,
          },
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: FAQ_HIGHLIGHT_COLOR }} />}
          aria-controls={`faq-content-${question}`}
          id={`faq-header-${question}`}
          sx={{
            p: ACCORDION_SUMMARY_PADDING,
            "&.MuiAccordionSummary-root": {
              minHeight: ACCORDION_ITEM_MIN_HEIGHT,
            },
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
          }}
        >
          <CheckCircleIcon
            sx={{ mr: 1, color: FAQ_HIGHLIGHT_COLOR, fontSize: 20 }}
          />
          <Typography
            component="h3"
            sx={{
              fontWeight: FAQ_ITEM_QUESTION_FONT_WEIGHT,
              fontSize: FAQ_ITEM_QUESTION_FONT_SIZE,
            }}
          >
            {question}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            backgroundColor: FAQ_ACCORDION_DETAILS_BG,
            p: ACCORDION_DETAILS_PADDING,
          }}
        >
          <Typography
            component="p"
            sx={{
              color: FAQ_ITEM_ANSWER_COLOR,
              whiteSpace: "pre-line",
              fontSize: FAQ_ITEM_ANSWER_FONT_SIZE,
              lineHeight: FAQ_ITEM_ANSWER_LINE_HEIGHT,
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
   9) SUBCOMPONENTE: FAQList
   ------------------------------------------------------------------------- */
function FAQList() {
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ width: "100%" }}
    >
      <Grid container spacing={3}>
        {faqItems.map((faq, index) => (
          <Grid item xs={12} key={faq.question}>
            <FAQItem
              question={faq.question}
              answer={faq.answer}
              delay={index * 0.1}
            />
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
   10) COMPONENTE PRINCIPAL: FAQSectionTalberos
   ------------------------------------------------------------------------- */
export default function FAQSectionTalberos() {
  return (
    <Box
      component="section"
      id="faq-section-talberos"
      aria-label="Preguntas Frecuentes de Talberos"
      sx={{
        width: "100%",
        overflow: "hidden",
        py: SECTION_PADDING_Y,
        px: SECTION_PADDING_X,
        background: FAQ_BG_GRADIENT,
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Burbuja decorativa grande */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: BUBBLE_OPACITY_LARGE }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: `${BUBBLE_SIZE_LARGE}px`,
          height: `${BUBBLE_SIZE_LARGE}px`,
          background: `radial-gradient(circle, ${FAQ_HIGHLIGHT_COLOR} 0%, transparent 70%)`,
          borderRadius: "50%",
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
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: `${BUBBLE_SIZE_SMALL}px`,
          height: `${BUBBLE_SIZE_SMALL}px`,
          background: `radial-gradient(circle, ${FAQ_HIGHLIGHT_COLOR} 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <Container maxWidth={MAX_WIDTH_CONTAINER} sx={{ position: "relative", zIndex: 2 }}>
        {/* Título de la sección */}
        <FAQSectionTitle />

        {/* Lista de preguntas frecuentes */}
        <FAQList />
      </Container>
    </Box>
  );
}
