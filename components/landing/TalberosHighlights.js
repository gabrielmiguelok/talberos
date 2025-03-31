'use client';
// @components/landing/TalberosHighlights.js

/**
 * @file TalberosHighlights.js
 * @description Componente React que presenta cuatro aspectos clave de Talberos,
 *              mostrando tarjetas con íconos, descripciones y bullet points.
 *              Se aplican principios SOLID, manteniendo la cohesión y autonomía de cada parte,
 *              y se optimiza la disposición, accesibilidad y rendimiento para un repositorio MIT.
 *
 * SRP (Single Responsibility Principle):
 *   - Se encarga exclusivamente de renderizar la sección de “características principales” de Talberos.
 *
 * OCP (Open/Closed Principle):
 *   - Permite agregar nuevas tarjetas en `aspectsData` sin modificar la lógica central.
 *
 * LSP e ISP:
 *   - Cada parte es independiente y no existen herencias innecesarias; la interfaz de MUI y Framer Motion
 *     se encapsula en componentes autoexplicativos.
 *
 * DIP (Dependency Inversion Principle):
 *   - El componente no asume detalles internos de la gestión de datos, recibiéndolos de forma local.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';

// Íconos de Material UI
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * @constant {Array<Object>} aspectsData
 * Información de cada “aspecto clave” de Talberos.
 * - title: Título representativo.
 * - icon: Ícono que refuerza el concepto.
 * - description: Explicación breve de la característica.
 * - bulletPoints: Lista de puntos adicionales.
 */
const aspectsData = [
  {
    title: 'Licencia 100% MIT',
    icon: <SecurityIcon sx={{ fontSize: 50, color: '#FF00AA' }} />,
    description:
      'Talberos es completamente gratuito y open source. La comunidad puede integrarlo sin restricciones, contribuyendo a un ecosistema colaborativo.',
    bulletPoints: [
      'Uso libre en proyectos comerciales',
      'Fork y personalización sin límites',
      'Contribuciones abiertas en GitHub',
    ],
  },
  {
    title: 'Estilo Excel “Real”',
    icon: <RocketLaunchIcon sx={{ fontSize: 50, color: '#FF00AA' }} />,
    description:
      'Integración nativa de funciones similares a Excel: filtrado avanzado, selección múltiple, edición en vivo y exportación a XLSX.',
    bulletPoints: [
      'Selección con clic+arrastre “tipo Excel”',
      'Edición en celda y validaciones',
      'Exportable a .xlsx sin librerías adicionales',
    ],
  },
  {
    title: 'Modo Oscuro y Claro',
    icon: <BuildCircleIcon sx={{ fontSize: 50, color: '#FF00AA' }} />,
    description:
      'Permite alternar entre temas claro y oscuro con un simple toggle. Ideal para brindar una experiencia visual adaptada a las preferencias del usuario.',
    bulletPoints: [
      'Variables CSS para colores y estilos',
      'Diseño adaptable y responsivo',
      'Punto de partida para personalizar tu branding',
    ],
  },
  {
    title: 'Arquitectura Moderna',
    icon: <SecurityIcon sx={{ fontSize: 50, color: '#FF00AA' }} />,
    description:
      'Basado en React, Next.js y React Table. Aprovecha patrones SOLID y clean code para un desarrollo mantenible y escalable, tanto en el front como en el back.',
    bulletPoints: [
      'Hooks especializados (useCellSelection, etc.)',
      'Fácil integración con Material UI',
      'Ejemplo completo con SSR y endpoints en Next.js',
    ],
  },
];

/**
 * @function TalberosHighlights
 * @description Renderiza la sección de tarjetas con los aspectos clave de Talberos,
 *              optimizando espacios, jerarquías y efectos para una experiencia accesible y didáctica.
 * @returns {JSX.Element} Sección completa para incluir en una Landing Page.
 */
export default function TalberosHighlights() {
  return (
    <Box
      component="section"
      id="talberos-highlights"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#121212', // Fondo oscuro sólido
        color: '#FFFFFF',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        textAlign: 'center',
        userSelect: 'none',
      }}
      aria-label="Características Destacadas de Talberos"
    >
      {/* Encabezado de la sección */}
      <header>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            sx={{ color: '#FF00AA', mb: 6 }} // Aumenta el margen inferior para separar el título del contenido
          >
            Características Destacadas de Talberos
          </Typography>
          <Typography
            component="p"
            sx={{
              color: '#fff',
              mb: 10,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Descubre cómo Talberos lleva las tablas en React al siguiente nivel. Desde la
            flexibilidad de la licencia MIT hasta la experiencia Excel-like que tus usuarios
            necesitan.
          </Typography>
        </motion.div>
      </header>

      {/* Contenedor de la grilla de tarjetas */}
      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4} alignItems="stretch">
          {aspectsData.map((aspect, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    backgroundColor: '#242424',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    p: 3,
                  }}
                  elevation={6}
                >
                  {/* Encabezado interno de cada tarjeta */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {aspect.icon}
                    <Typography
                      variant="h6"
                      component="h3"
                      fontWeight="bold"
                      sx={{ mt: 2, mb: 2, color: '#fff' }}
                    >
                      {aspect.title}
                    </Typography>
                  </Box>

                  {/* Contenido descriptivo y lista de bullet points */}
                  <CardContent sx={{ flexGrow: 1, p: 0 }}>
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        color: '#fff',
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {aspect.description}
                    </Typography>

                    <List sx={{ p: 0 }}>
                      {aspect.bulletPoints.map((point, i) => (
                        <ListItem key={i} disableGutters sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                            <CheckCircleOutlineIcon sx={{ color: '#FF00AA', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { color: '#fff' },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Elementos decorativos: burbujas con efectos de opacidad */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.12 }}
        transition={{ duration: 1, delay: 0.5 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, #FF00AA 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.8 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, #FF00AA 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
    </Box>
  );
}
