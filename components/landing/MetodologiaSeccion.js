/**
 * @file MetodologiaSeccion.jsx
 * @description
 * Sección que describe de manera inspiracional la metodología de trabajo
 * y las etapas que se siguen para crear productos digitales robustos.
 *
 * Principios aplicados:
 *  - SOLID:
 *    * SRP (Single Responsibility Principle): Este archivo se encarga
 *      únicamente de renderizar la sección de metodología.
 *    * OCP/ISP/DIP: Evitamos dependencias rígidas e interfaces innecesarias,
 *      usando un subcomponente (StepCard) para cada tarjeta.
 *    * Sin herencias (usamos componentes funcionales en React).
 *  - Alta cohesión: La lógica de metodología está concentrada y no se mezcla
 *    con otras responsabilidades.
 *  - Auto-documentado: Comentarios claros que explican la intención de cada
 *    parte del código.
 */

'use client';

import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Slide, Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';

// Íconos de Material UI
import { QueryBuilder, Build, Repeat, RocketLaunch } from '@mui/icons-material';

/**
 * @constant {Array<Object>} methodologySteps
 * Arreglo con la información de cada etapa del proceso.
 *  - icon: Icono representativo.
 *  - title: Título del paso.
 *  - description: Breve explicación inspiracional del paso.
 */
const methodologySteps = [
  {
    icon: <QueryBuilder sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: '1. Exploración Inicial',
    description:
      'Escuchamos tus ideas, retos y objetivos. Descubrimos el contexto, aclaramos alcances y trazamos una visión compartida para avanzar con rumbo definido.',
  },
  {
    icon: <Build sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: '2. Diseño Sólido y Cohesión',
    description:
      'Estructuramos una base robusta y mantenible. Cada componente cumple su función sin depender en exceso de los demás, asegurando escalabilidad y claridad.',
  },
  {
    icon: <Repeat sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: '3. Desarrollo Ágil',
    description:
      'Creamos y validamos en ciclos iterativos. Unimos feedback constante con un desarrollo fluido, garantizando que el producto evolucione y se ajuste a la realidad.',
  },
  {
    icon: <RocketLaunch sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: '4. Despliegue y Evolución',
    description:
      'Llevamos la solución a producción con infraestructuras modernas. Monitoreamos, damos soporte y crecemos sin fricciones, adaptándonos a nuevas oportunidades.',
  },
];

/**
 * @component StepCard
 * @description
 * Subcomponente encargado de renderizar una tarjeta con un ícono,
 * un título y una descripción sobre la metodología.
 *
 * @param {Object} props
 * @param {JSX.Element} props.icon - Ícono representativo del paso.
 * @param {string} props.title - Título que describe la etapa.
 * @param {string} props.description - Texto explicando la importancia de la etapa.
 */
function StepCard({ icon, title, description }) {
  return (
    <Tilt
      perspective={900}
      glareEnable
      glareMaxOpacity={0.15}
      style={{ height: '100%' }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: '#242424',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          transition: 'transform 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {icon}
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ color: '#FF00AA' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#fff',
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </Paper>
    </Tilt>
  );
}

/**
 * @component MetodologiaSeccion
 * @description
 * Sección principal que engloba toda la parte de la metodología:
 * título, subtítulo y tarjetas para cada paso. Se ubica normalmente
 * justo después del Hero en la landing page.
 */
export default function MetodologiaSeccion() {
  return (
    <Box
      id="metodologia-desarrollo"
      sx={{
        py: 10,
        px: { xs: 2, md: 6 },
        background: 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)',
        color: '#fff',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Animación de entrada para la cabecera (SLIDE) */}
      <Slide direction="up" triggerOnce>
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4, color: '#FF00AA' }}
        >
          Metodología
        </Typography>

        <Typography
          align="center"
          sx={{
            mb: 8,
            color: '#fff',
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.7,
            fontSize: { xs: '1rem', md: '1.1rem' },
          }}
        >
          Desde la primera idea hasta el despliegue final, cada etapa está diseñada
          para brindar una experiencia fluida y resultados sólidos. Nuestro enfoque
          se basa en la transparencia, la retroalimentación constante y la mejora continua.
        </Typography>
      </Slide>

      {/* Animación de las tarjetas (ZOOM) */}
      <Zoom cascade damping={0.1} triggerOnce>
        <Grid container spacing={4}>
          {methodologySteps.map((step, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </Grid>
          ))}
        </Grid>
      </Zoom>
    </Box>
  );
}
