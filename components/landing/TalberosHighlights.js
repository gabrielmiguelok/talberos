'use client';
// @components/landing/TalberosHighlights.js

/**
 * @file TalberosHighlights.js
 * @description Componente React que presenta cuatro aspectos clave de Talberos, 
 *              adaptando un diseño de tarjetas con íconos y bullet points. 
 *              Aplicando principios de SOLID y respetando la estética del layout 
 *              con MUI + Framer Motion.
 * 
 * SRP (Single Responsibility Principle):
 *   - Este componente se encarga ÚNICAMENTE de renderizar la sección con las tarjetas 
 *     de “características principales” de la librería Talberos.
 * 
 * OCP (Open/Closed Principle):
 *   - El componente admite la adición de más tarjetas (elementos en `aspectsData`) sin 
 *     requerir modificar la lógica principal.
 * 
 * LSP e ISP:
 *   - No hay herencias complejas ni dependencias forzadas. Cada parte se explica por sí misma, 
 *     y el uso de MUI + Framer Motion se encapsula en esta interfaz sin afectar a otras capas.
 * 
 * DIP (Dependency Inversion Principle):
 *   - El componente no asume detalles de implementación de “cómo se gestiona la data”. 
 *     Recibe la data (en este caso, internamente) y la pinta. Podría extraerse a 
 *     un hook externo si fuera necesario.
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

// Íconos MUI
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * @constant {Array<Object>} aspectsData
 * Contiene la información de cada “aspecto clave” de Talberos.
 *  - title: Título corto y representativo de la característica.
 *  - icon: Ícono JSX que refuerza el concepto.
 *  - description: Breve explicación de por qué es importante en Talberos.
 *  - bulletPoints: Lista de bullet points que amplían la idea principal.
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
 * @description Renderiza una sección con tarjetas que muestran los aspectos 
 *              clave de la librería Talberos. 
 * @returns {JSX.Element} Sección lista para ser ubicada en una Landing Page.
 */
export default function TalberosHighlights() {
  return (
    <Box
      component="section"
      id="talberos-highlights"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#121212', // Fondo sólido oscuro
        color: '#FFFFFF',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        textAlign: 'center',
        userSelect: 'none'
      }}
    >
      {/* Encabezado principal de la sección */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: '#FF00AA', mb: 3 }}
        >
          Características Destacadas de Talberos
        </Typography>
        <Typography
          sx={{
            color: '#fff', 
            mb: 6,
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Descubre cómo Talberos lleva las tablas en React al siguiente nivel. 
          Desde la flexibilidad de la licencia MIT hasta la experiencia Excel-like 
          que tus usuarios necesitan.
        </Typography>
      </motion.div>

      {/* Grid de aspectos clave */}
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
                {/* Ícono y título */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  {aspect.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, color: '#fff' }}>
                    {aspect.title}
                  </Typography>
                </Box>

                {/* Contenido principal: descripción y bullets */}
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#fff',
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {aspect.description}
                  </Typography>

                  <List sx={{ p: 0 }}>
                    {aspect.bulletPoints.map((point, i) => (
                      <ListItem key={i} disableGutters>
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

      {/* Burbujas decorativas (opcional, para dar un toque visual) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.12 }}
        transition={{ duration: 1, delay: 0.5 }}
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
