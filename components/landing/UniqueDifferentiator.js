'use client';

/**
 * @module UniqueDifferentiator
 * @description
 * Este módulo define un componente principal que describe el valor diferencial de la librería
 * Talberos, resaltando sus ventajas y características sin caer en tecnicismos complejos.
 * Se orienta a la presentación en la página web, con un estilo visual atractivo y mensajes
 * claros sobre lo que hace a Talberos una opción única.
 *
 * Principios SOLID aplicados:
 * - **S**ingle Responsibility: Cada parte del código cumple una función específica (datos de bloques,
 *   secciones de contenido, estilo visual).
 * - **O**pen/Closed: La estructura se puede ampliar con más secciones u otros bloques sin
 *   modificar la base.
 * - **L**iskov Substitution: Al ser componentes funcionales independientes (sin herencia),
 *   pueden sustituirse o moverse libremente.
 * - **I**nterface Segregation: El componente no fuerza props innecesarias, se mantiene
 *   conciso en lo que recibe y muestra.
 * - **D**ependency Inversion: No hay dependencias rígidas ni herencia; cada elemento funciona
 *   con datos externos independientes (por ejemplo, `bloquesDestacados`).
 *
 * Cohesión y autodocumentación:
 * - Se han incluido comentarios de JSDoc que explican la intención de cada parte.
 * - Se evita el acoplamiento excesivo (todo está modularizado y cumple un objetivo claro).
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
  useMediaQuery
} from '@mui/material';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * Bloques destacados que comunican los pilares fundamentales de Talberos
 * sin abundar en tecnicismos. Cada bloque tiene un ícono, un título y
 * un texto explicativo.
 */
const bloquesDestacados = [
  {
    titulo: 'Agilidad y Escalabilidad',
    texto: `Talberos se integra fácilmente a tu proyecto y crece contigo.
    Es rápido de implementar, pero no sacrifica un enfoque limpio y sostenible.
    Logra resultados profesionales sin enredos técnicos.`,
    icono: <RocketLaunchIcon sx={{ fontSize: 60, color: '#FF00AA' }} />,
  },
  {
    titulo: 'Código Abierto y Mantenible',
    texto: `Al ser totalmente open source (MIT), Talberos promueve la libertad de
    adaptación y la cooperación de la comunidad. Sus principios de clean code
    garantizan estabilidad y escalabilidad a largo plazo.`,
    icono: <CodeIcon sx={{ fontSize: 60, color: '#FF00AA' }} />,
  },
  {
    titulo: 'Seguridad Integrada',
    texto: `Incorpora buenas prácticas de seguridad desde la base, reforzando cada
    módulo para proteger tus datos. Aquí, la seguridad no es una capa adicional,
    sino parte esencial de la arquitectura.`,
    icono: <SecurityIcon sx={{ fontSize: 60, color: '#FF00AA' }} />,
  },
];

/**
 * Componente principal que describe el “Diferenciador Único” de Talberos:
 * - Incluye una presentación enfocada en la propuesta de valor.
 * - Muestra los bloques destacados (arriba).
 * - Muestra una sección intermedia con ejemplos de fortalezas (Clean Code, modularidad, etc.).
 * - Concluye con un “resultado final” que realza la ventaja de Talberos para
 *   optimizar y asegurar tu proyecto.
 *
 * @function UniqueDifferentiator
 * @returns {JSX.Element} Sección completa con la información adaptada.
 */
export default function UniqueDifferentiator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      id="diferenciador-unico"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#121212',
        color: '#FFFFFF',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        userSelect: 'none',
      }}
    >
      {/* ENCABEZADO PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center' }}
      >
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#FF00AA', mb: 3 }}>
          ¿Por qué Talberos es único?
        </Typography>
        <Typography sx={{ color: '#fff', mb: 6, maxWidth: '800px', margin: '0 auto' }}>
          Combinamos la experiencia de una tabla Excel-like con la libertad
          de un proyecto Open Source. Talberos nace para crecer contigo y
          mantener tu código claro y seguro, incluso cuando tus datos se multipliquen.
        </Typography>
      </motion.div>

      {/* BLOQUES DESTACADOS (Arriba) */}
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
                  backgroundColor: '#242424',
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
                {/* Ícono */}
                <Box sx={{ mb: 2 }}>{bloque.icono}</Box>

                {/* Título */}
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 1, color: '#fff' }}
                >
                  {bloque.titulo}
                </Typography>

                {/* Texto */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#fff',
                    lineHeight: 1.6,
                  }}
                >
                  {bloque.texto}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* SECCIÓN INTERMEDIA */}
      <Box
        sx={{
          mt: 10,
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
            {/* Imagen o gráfico decorativo */}
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                image="/logo.png"
                alt="Talberos Advantage"
                sx={{
                  borderRadius: 3,
                  display: isMobile ? 'none' : 'block',
                }}
              />
            </Grid>

            {/* Texto al lado */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: '#FF00AA', mb: 2 }}
              >
                Enfoque centrado en calidad
              </Typography>
              <Typography sx={{ mb: 3, color: '#fff', fontSize: '1rem', lineHeight: 1.7 }}>
                Talberos está dirigido a quienes buscan un producto sólido desde la base:
                código limpio, modularidad, escalabilidad y seguridad sin rodeos.
              </Typography>

              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#FF00AA' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Clean Code y Documentación Clara"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#FF00AA' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Arquitectura Modular (Principios SOLID)"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#FF00AA' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experiencia Excel-like y Flexibilidad React"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>

                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#FF00AA' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Seguridad y Rendimiento en Cada Capa"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </motion.div>
      </Box>

      {/* RESULTADO FINAL (Texto más grande y destacado) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Box sx={{ mt: 10, textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
          <StarOutlineIcon sx={{ color: '#FF00AA', fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF00AA', mb: 3 }}>
            El resultado de elegir Talberos
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              px: { xs: 2, md: 0 },
            }}
          >
            Una librería verdaderamente diferenciada: <em>abierta, escalable y con
            seguridad incorporada</em>. Olvídate de parches improvisados: empieza con
            Talberos y ahorra tiempo, dinero y dolores de cabeza en el futuro.
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
