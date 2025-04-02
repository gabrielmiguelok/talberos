"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/MetodologiaSeccion.js
 *
 * DESCRIPCIÓN:
 *   - Explica la metodología de desarrollo de Talberos.
 *   - Incluye variables de configuración para colores y tipografías,
 *     evitando la confusión de "h2", "h3" de Material UI para un mayor
 *     control semántico y de tamaño real.
 *
 * LICENCIA:
 *   - Bajo licencia MIT.
 */

import React from 'react';
import { Box, Typography, Grid, Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Slide, Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';
import { Code, Layers, Refresh, RocketLaunch } from '@mui/icons-material';

/** ---------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN
 * ---------------------------------------------------------------------------*/
const BG_GRADIENT = 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)';
const TEXT_COLOR = '#FFFFFF';
const HEADING_COLOR = '#FF00AA';
const PAPER_BG_COLOR = '#242424';

const SECTION_PADDING_Y = 12;
const SECTION_PADDING_X_MOBILE = 2;
const SECTION_PADDING_X_DESKTOP = 6;

const HEADLINE_FONT_SIZE_DESKTOP = '2rem';
const HEADLINE_FONT_SIZE_MOBILE = '1.6rem';
const PARAGRAPH_FONT_SIZE_DESKTOP = '1rem';
const PARAGRAPH_FONT_SIZE_MOBILE = '0.95rem';

/**
 * Lista de pasos metodológicos de Talberos.
 * Íconos con aria-hidden porque son decorativos.
 */
const methodologySteps = [
  {
    icon: <Code sx={{ fontSize: 40, color: HEADING_COLOR }} aria-hidden="true" />,
    title: 'Código Abierto y Limpio',
    description:
      'El código fuente de Talberos es totalmente abierto bajo licencia MIT. Puedes auditarlo, mejorarlo o adaptarlo según tus necesidades desde el primer momento.',
  },
  {
    icon: <Layers sx={{ fontSize: 40, color: HEADING_COLOR }} aria-hidden="true" />,
    title: 'Arquitectura Modular',
    description:
      'Diseñado siguiendo principios SOLID para máxima escalabilidad, facilidad de mantenimiento e integración fluida en cualquier proyecto React.',
  },
  {
    icon: <Refresh sx={{ fontSize: 40, color: HEADING_COLOR }} aria-hidden="true" />,
    title: 'Actualizaciones Constantes',
    description:
      'Talberos evoluciona semana a semana con nuevas funcionalidades, mejoras de rendimiento, seguridad y compatibilidad basadas en la retroalimentación de la comunidad.',
  },
  {
    icon: <RocketLaunch sx={{ fontSize: 40, color: HEADING_COLOR }} aria-hidden="true" />,
    title: 'Listo para Producción',
    description:
      'Documentación clara, ejemplos prácticos y componentes listos para usar en producción, facilitando despliegues ágiles y escalables.',
  },
];

/**
 * Componente MetodologiaSeccion:
 * Muestra la metodología de Talberos, con animaciones condicionadas por
 * prefers-reduced-motion.
 */
export default function MetodologiaSeccion() {
  const theme = useTheme();
  // Preferencia del usuario en animaciones
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Box
      component="section"
      role="region"
      id="metodologia-talberos"
      aria-labelledby="metodologia-heading"
      sx={{
        py: SECTION_PADDING_Y,
        px: { xs: SECTION_PADDING_X_MOBILE, md: SECTION_PADDING_X_DESKTOP },
        background: BG_GRADIENT,
        color: TEXT_COLOR,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <header>
        {reduceMotion ? (
          <HeaderContent />
        ) : (
          <Slide direction="up" triggerOnce>
            <HeaderContent />
          </Slide>
        )}
      </header>

      {reduceMotion ? (
        <MethodologyGrid steps={methodologySteps} noAnimation />
      ) : (
        <Zoom cascade damping={0.1} triggerOnce>
          <MethodologyGrid steps={methodologySteps} />
        </Zoom>
      )}
    </Box>
  );
}

/**
 * Subcomponente HeaderContent: Título y subtítulo de la sección.
 */
function HeaderContent() {
  // Usamos un hook simple o prop si quisiéramos diferenciar tamaños en mobile.
  // Por simplicidad, se mantiene un tamaño único.
  return (
    <>
      <Typography
        id="metodologia-heading"
        component="h2"
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: 3,
          color: HEADING_COLOR,
          fontSize: HEADLINE_FONT_SIZE_DESKTOP,
        }}
      >
        ¿Cómo evoluciona Talberos?
      </Typography>

      <Typography
        component="p"
        sx={{
          textAlign: 'center',
          marginBottom: 8,
          color: TEXT_COLOR,
          maxWidth: '800px',
          marginX: 'auto',
          lineHeight: 1.7,
          fontSize: PARAGRAPH_FONT_SIZE_DESKTOP,
        }}
      >
        Nuestro framework crece a partir de una base sólida, código abierto y
        contribuciones continuas de la comunidad. Descubre cómo construimos y
        mejoramos cada aspecto, semana tras semana.
      </Typography>
    </>
  );
}

/**
 * Grid con los pasos metodológicos. Condiciona animaciones si noAnimation = true.
 */
function MethodologyGrid({ steps, noAnimation = false }) {
  return (
    <Grid
      container
      spacing={6}
      component="ol"
      sx={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {steps.map((step, index) => (
        <Grid
          key={index}
          item
          xs={12}
          sm={6}
          md={3}
          component="li"
          aria-label={`Paso ${index + 1}: ${step.title}`}
        >
          <Tilt glareEnable={!noAnimation} glareMaxOpacity={0.15}>
            <Paper
              component="article"
              elevation={6}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: PAPER_BG_COLOR,
                height: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {step.icon}
              </Box>
              <Typography
                component="h3"
                sx={{
                  fontWeight: 'bold',
                  color: HEADING_COLOR,
                  marginBottom: 2,
                  fontSize: '1.25rem',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                component="p"
                sx={{
                  color: TEXT_COLOR,
                  flexGrow: 1,
                  fontSize: PARAGRAPH_FONT_SIZE_DESKTOP,
                }}
              >
                {step.description}
              </Typography>
            </Paper>
          </Tilt>
        </Grid>
      ))}
    </Grid>
  );
}
