"use client";

import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Slide, Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';
import { Code, Layers, Refresh, RocketLaunch } from '@mui/icons-material';

/**
 * Pasos metodológicos adaptados al proceso de desarrollo del framework Talberos.
 *
 * Cada paso se representa como un artículo independiente para mejorar la semántica
 * y la accesibilidad, permitiendo a los lectores de pantalla identificar cada sección.
 */
const methodologySteps = [
  {
    icon: <Code sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: 'Código Abierto y Limpio',
    description: 'El código fuente de Talberos es totalmente abierto bajo licencia MIT. Puedes auditarlo, mejorarlo o adaptarlo según tus necesidades desde el primer momento.'
  },
  {
    icon: <Layers sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: 'Arquitectura Modular',
    description: 'Diseñado siguiendo principios SOLID para máxima escalabilidad, facilidad de mantenimiento e integración fluida en cualquier proyecto React.'
  },
  {
    icon: <Refresh sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: 'Actualizaciones Constantes',
    description: 'Talberos evoluciona semana a semana con nuevas funcionalidades, mejoras de rendimiento, seguridad y compatibilidad basadas en la retroalimentación de la comunidad.'
  },
  {
    icon: <RocketLaunch sx={{ fontSize: 40, color: '#FF00AA' }} />,
    title: 'Listo para Producción',
    description: 'Documentación clara, ejemplos prácticos y componentes listos para usar en producción, facilitando despliegues ágiles y escalables.'
  },
];

/**
 * Componente de sección que muestra la metodología del framework Talberos.
 * Se han incorporado mejoras de accesibilidad mediante el uso de etiquetas semánticas y atributos ARIA.
 *
 * @component MetodologiaSeccion
 * @returns {JSX.Element} Componente que renderiza la sección de metodología.
 *
 * @example
 * // Uso del componente:
 * <MetodologiaSeccion />
 */
export default function MetodologiaSeccion() {
  return (
    <Box
      component="section"
      id="metodologia-talberos"
      aria-labelledby="metodologia-title"
      sx={{
        py: 10,
        px: { xs: 2, md: 6 },
        background: 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)',
        color: '#fff',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Slide direction="up" triggerOnce>
        <Typography
          id="metodologia-title"
          variant="h3"
          component="h2"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4, color: '#FF00AA' }}
        >
          ¿Cómo evoluciona Talberos?
        </Typography>

        <Typography
          component="p"
          align="center"
          sx={{ mb: 8, color: '#fff', maxWidth: '800px', mx: 'auto', lineHeight: 1.7 }}
        >
          Nuestro framework crece a partir de una base sólida, código abierto y contribuciones continuas de la comunidad. Descubre cómo construimos y mejoramos cada aspecto semana tras semana.
        </Typography>
      </Slide>

      <Zoom cascade damping={0.1} triggerOnce>
        <Grid container spacing={4}>
          {methodologySteps.map((step, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <Tilt glareEnable glareMaxOpacity={0.15}>
                <Paper
                  component="article"
                  elevation={6}
                  sx={{ p: 3, borderRadius: 3, backgroundColor: '#242424', height: '100%', textAlign: 'center' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {step.icon}
                  </Box>
                  <Typography variant="h6" component="h3" fontWeight="bold" sx={{ color: '#FF00AA', mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography component="p" variant="body2" sx={{ color: '#fff' }}>
                    {step.description}
                  </Typography>
                </Paper>
              </Tilt>
            </Grid>
          ))}
        </Grid>
      </Zoom>
    </Box>
  );
}
