/**
 * FAQSectionTalberos.js
 *
 * MIT License
 *
 * Sección de Preguntas Frecuentes (FAQs) para Talberos, una librería MIT
 * que facilita la creación de tablas estilo Excel en React.
 *
 * PRINCIPIOS BÁSICOS (SOLID):
 *  - SRP (Single Responsibility Principle):
 *    Cada subcomponente (título, ítems) tiene su rol único.
 *  - LSP/ISP/DIP:
 *    Preferimos composición de componentes funcionales,
 *    sin dependencias o herencias rígidas.
 *
 * DESCRIPCIÓN:
 *  - Este componente elimina la dependencia de `react-intersection-observer`,
 *    usando solo `whileInView` de framer-motion para las transiciones.
 *  - Con ello, evitamos el error "TypeError: Cannot read properties of null (reading 'useState')"
 *    en entornos Next.js SSR.
 *
 * USO:
 *  - Simplemente importa y renderiza <FAQSectionTalberos/> en tu landing
 *    o en la sección deseada. No requiere dynamic import ni SSR desactivado.
 */

"use client"; // Indica que este archivo se renderiza en el cliente

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

// Framer Motion
import { motion } from 'framer-motion';

/* ----------------------------------------------------------
   1) DATOS DE PREGUNTAS FRECUENTES
   ---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   2) ANIMACIONES: VARIANTS
   ---------------------------------------------------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// Contenedor que aplica un stagger (retraso) en la aparición de ítems
const containerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/* ----------------------------------------------------------
   3) SUBCOMPONENTE: FAQSectionTitle
   ---------------------------------------------------------- */
function FAQSectionTitle() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 5, sm: 6 } }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        // Este viewport se encarga de la animación al aparecer
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h2"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: isMobile ? '2.3rem' : '2.7rem',
            color: '#FF00AA',
          }}
        >
          Preguntas Frecuentes
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            mt: 1,
            color: '#ddd',
            maxWidth: '700px',
            margin: '0 auto',
            fontSize: { xs: '1rem', sm: '1.1rem' },
          }}
        >
          ¿Dudas sobre Talberos? Aquí encontrarás las respuestas más comunes
          para comprender la potencia de esta librería.
        </Typography>
      </motion.div>
    </Box>
  );
}

/* ----------------------------------------------------------
   4) SUBCOMPONENTE: FAQItem
   ---------------------------------------------------------- */
function FAQItem({ question, answer, delay = 0 }) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Accordion
        sx={{
          backgroundColor: '#242424',
          color: '#fff',
          borderRadius: 2,
          border: '1px solid #2F2F2F',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          },
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#FF00AA' }} />}
          aria-controls={`faq-content-${question}`}
          id={`faq-header-${question}`}
        >
          <CheckCircleIcon sx={{ mr: 1, color: '#FF00AA' }} />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#1F1F1F' }}>
          <Typography
            variant="body1"
            sx={{
              color: '#ddd',
              whiteSpace: 'pre-line',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            {answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
}

/* ----------------------------------------------------------
   5) SUBCOMPONENTE: FAQList
   ---------------------------------------------------------- */
function FAQList() {
  return (
    <motion.div
      // Contenedor principal que controlará la animación escalonada
      variants={containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ width: '100%' }}
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

/* ----------------------------------------------------------
   6) COMPONENTE PRINCIPAL: FAQSectionTalberos
   ---------------------------------------------------------- */
export default function FAQSectionTalberos() {
  return (
    <Box
      component="section"
      id="faq-section-talberos"
      sx={{
        width: '100%',
        overflow: 'hidden',
        py: { xs: 6, sm: 8 },
        px: { xs: 2, md: 6 },
        background: 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* BURBUJAS DECORATIVAS EN EL FONDO */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, #FF00AA 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.08 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, #FF00AA 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* TÍTULO DE SECCIÓN */}
        <FAQSectionTitle />

        {/* LISTADO DE FAQs */}
        <FAQList />
      </Container>
    </Box>
  );
}
