"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/UniqueDifferentiator.js
 *
 * DESCRIPCIÓN:
 *   - Componente que describe el valor diferencial de Talberos, enfatizando
 *     sus características únicas en la Landing Page.
 *
 * LICENCIA:
 *   - Bajo licencia MIT, con fines educativos y demostrativos.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

/** ---------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN (Colores, tamaños, etc.)
 * ---------------------------------------------------------------------------*/
const SECTION_BG_COLOR = "#121212";
const CARD_BG_COLOR = "#242424";
const HEADING_COLOR = "#FF00AA";
const TEXT_COLOR = "#FFFFFF";

const HEADING_FONT_SIZE = "2rem";
const SUBHEADING_FONT_SIZE = "1.2rem";
const PARAGRAPH_FONT_SIZE = "1rem";

/**
 * Bloques destacados: (icono, titulo, texto).
 */
const bloquesDestacados = [
  {
    titulo: 'Agilidad y Escalabilidad',
    texto: `Talberos se integra fácilmente a tu proyecto y crece contigo.
    Es rápido de implementar, pero no sacrifica un enfoque limpio y sostenible.
    Logra resultados profesionales sin enredos técnicos.`,
    icono: <RocketLaunchIcon sx={{ fontSize: 60, color: HEADING_COLOR }} aria-hidden="true" />,
  },
  {
    titulo: 'Código Abierto y Mantenible',
    texto: `Al ser totalmente open source (MIT), Talberos promueve la libertad de
    adaptación y la cooperación de la comunidad. Sus principios de clean code
    garantizan estabilidad y escalabilidad a largo plazo.`,
    icono: <CodeIcon sx={{ fontSize: 60, color: HEADING_COLOR }} aria-hidden="true" />,
  },
  {
    titulo: 'Seguridad Integrada',
    texto: `Incorpora buenas prácticas de seguridad desde la base, reforzando cada
    módulo para proteger tus datos. Aquí, la seguridad no es una capa adicional,
    sino parte esencial de la arquitectura.`,
    icono: <SecurityIcon sx={{ fontSize: 60, color: HEADING_COLOR }} aria-hidden="true" />,
  },
];

export default function UniqueDifferentiator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      id="diferenciador-unico"
      aria-labelledby="unique-differentiator-heading"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: SECTION_BG_COLOR,
        color: TEXT_COLOR,
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        userSelect: 'none',
      }}
    >
      {/* ENCABEZADO PRINCIPAL */}
      <header style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            id="unique-differentiator-heading"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              color: HEADING_COLOR,
              fontSize: HEADING_FONT_SIZE,
            }}
          >
            ¿Por qué Talberos es único?
          </Typography>

          <Typography
            component="p"
            sx={{
              color: TEXT_COLOR,
              mb: 8,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: PARAGRAPH_FONT_SIZE,
            }}
          >
            Combinamos la experiencia de una tabla Excel-like con la libertad
            de un proyecto Open Source. Talberos nace para crecer contigo y
            mantener tu código claro y seguro, incluso cuando tus datos se multipliquen.
          </Typography>
        </motion.div>
      </header>

      {/* BLOQUES DESTACADOS */}
      <Box sx={{ mb: 10 }}>
        <Grid container spacing={4} alignItems="stretch">
          {bloquesDestacados.map((bloque, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    backgroundColor: CARD_BG_COLOR,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                  }}
                  elevation={6}
                >
                  <Box sx={{ mb: 2 }}>{bloque.icono}</Box>
                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      color: TEXT_COLOR,
                      fontSize: '1.2rem',
                    }}
                  >
                    {bloque.titulo}
                  </Typography>
                  <Typography
                    component="p"
                    sx={{
                      color: TEXT_COLOR,
                      lineHeight: 1.6,
                      fontSize: PARAGRAPH_FONT_SIZE,
                    }}
                  >
                    {bloque.texto}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* SECCIÓN INTERMEDIA */}
      <Box
        component="section"
        aria-label="Enfoque centrado en calidad"
        sx={{
          mt: 10,
          mb: 10,
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          backgroundColor: '#1F1F1F',
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Imagen decorativa para desktop */}
            {!isMobile && (
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  image="/logo.png"
                  alt="Talberos Advantage"
                  sx={{
                    borderRadius: 3,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Grid>
            )}
            {/* Texto y lista de fortalezas */}
            <Grid item xs={12} md={isMobile ? 12 : 6}>
              <Typography
                component="h3"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: HEADING_COLOR,
                  fontSize: SUBHEADING_FONT_SIZE,
                }}
              >
                Enfoque centrado en calidad
              </Typography>
              <Typography
                component="p"
                sx={{
                  mb: 3,
                  color: TEXT_COLOR,
                  fontSize: PARAGRAPH_FONT_SIZE,
                  lineHeight: 1.7,
                }}
              >
                Talberos está dirigido a quienes buscan un producto sólido desde la base:
                código limpio, modularidad, escalabilidad y seguridad sin rodeos.
              </Typography>

              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: HEADING_COLOR }} aria-hidden="true" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Clean Code y Documentación Clara"
                    primaryTypographyProps={{ sx: { color: TEXT_COLOR } }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: HEADING_COLOR }} aria-hidden="true" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Arquitectura Modular (Principios SOLID)"
                    primaryTypographyProps={{ sx: { color: TEXT_COLOR } }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: HEADING_COLOR }} aria-hidden="true" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experiencia Excel-like y Flexibilidad React"
                    primaryTypographyProps={{ sx: { color: TEXT_COLOR } }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: HEADING_COLOR }} aria-hidden="true" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Seguridad y Rendimiento en Cada Capa"
                    primaryTypographyProps={{ sx: { color: TEXT_COLOR } }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </motion.div>
      </Box>

      {/* RESULTADO FINAL */}
      <Box
        component="section"
        aria-label="Resultado de elegir Talberos"
        sx={{
          mt: 10,
          mb: 4,
          textAlign: 'center',
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <StarOutlineIcon sx={{ color: HEADING_COLOR, fontSize: 60, mb: 2 }} aria-hidden="true" />
          <Typography
            component="h3"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              color: HEADING_COLOR,
              fontSize: SUBHEADING_FONT_SIZE,
            }}
          >
            El resultado de elegir Talberos
          </Typography>
          <Typography
            component="p"
            sx={{
              color: TEXT_COLOR,
              fontSize: PARAGRAPH_FONT_SIZE,
              lineHeight: 1.7,
              px: { xs: 2, md: 0 },
            }}
          >
            Una librería verdaderamente diferenciada: <em>abierta, escalable y con seguridad incorporada</em>.
            Olvídate de parches improvisados: empieza con Talberos y ahorra tiempo, dinero y
            dolores de cabeza en el futuro.
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}
