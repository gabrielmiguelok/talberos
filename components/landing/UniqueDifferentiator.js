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
 * - **O**pen/Closed: La estructura se puede ampliar con más secciones u otros bloques sin modificar la base.
 * - **L**iskov Substitution: Al ser componentes funcionales independientes (sin herencia), pueden sustituirse o moverse libremente.
 * - **I**nterface Segregation: El componente no fuerza props innecesarias y se mantiene conciso.
 * - **D**ependency Inversion: Cada elemento utiliza datos externos independientes (ej. `bloquesDestacados`).
 *
 * Cohesión y autodocumentación:
 * - Se incluyen comentarios JSDoc que explican la intención de cada parte.
 * - Se evita el acoplamiento excesivo, manteniendo una estructura modular y clara.
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

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * Bloques destacados que comunican los pilares fundamentales de Talberos sin entrar en tecnicismos.
 * Cada bloque contiene un ícono, un título y un texto explicativo.
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
 * Componente principal que describe el “Diferenciador Único” de Talberos.
 * - Muestra una introducción con título y descripción.
 * - Renderiza los bloques destacados.
 * - Presenta una sección intermedia con un ejemplo visual y lista de fortalezas.
 * - Concluye con un bloque final resaltado.
 *
 * @function UniqueDifferentiator
 * @returns {JSX.Element} Sección completa lista para integrarse en la landing page.
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
      aria-label="Diferenciador Único de Talberos"
    >
      {/* ENCABEZADO PRINCIPAL */}
      <header>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            sx={{ color: '#FF00AA', mb: 4 }}
          >
            ¿Por qué Talberos es único?
          </Typography>
          <Typography
            component="p"
            sx={{
              color: '#fff',
              mb: 8,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
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
                    component="h3"
                    fontWeight="bold"
                    sx={{ mb: 2, color: '#fff' }}
                  >
                    {bloque.titulo}
                  </Typography>

                  {/* Texto descriptivo */}
                  <Typography
                    variant="body2"
                    component="p"
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
      </Box>

      {/* SECCIÓN INTERMEDIA */}
      <Box
        component="section"
        sx={{
          mt: 10,
          mb: 10,
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          backgroundColor: '#1F1F1F',
          position: 'relative',
        }}
        aria-label="Enfoque centrado en calidad"
      >
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Imagen o gráfico decorativo */}
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
                variant="h4"
                component="h3"
                fontWeight="bold"
                sx={{ color: '#FF00AA', mb: 2 }}
              >
                Enfoque centrado en calidad
              </Typography>
              <Typography
                component="p"
                sx={{ mb: 3, color: '#fff', fontSize: '1rem', lineHeight: 1.7 }}
              >
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

      {/* RESULTADO FINAL */}
      <Box
        component="section"
        sx={{
          mt: 10,
          mb: 4,
          textAlign: 'center',
          maxWidth: '900px',
          mx: 'auto',
        }}
        aria-label="Resultado de elegir Talberos"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <StarOutlineIcon sx={{ color: '#FF00AA', fontSize: 60, mb: 2 }} />
          <Typography
            variant="h4"
            component="h3"
            fontWeight="bold"
            sx={{ color: '#FF00AA', mb: 3 }}
          >
            El resultado de elegir Talberos
          </Typography>
          <Typography
            component="p"
            sx={{
              color: '#fff',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              px: { xs: 2, md: 0 },
            }}
          >
            Una librería verdaderamente diferenciada: <em>abierta, escalable y con seguridad incorporada</em>.
            Olvídate de parches improvisados: empieza con Talberos y ahorra tiempo, dinero y dolores de cabeza en el futuro.
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}
