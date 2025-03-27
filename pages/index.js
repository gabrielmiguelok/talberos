'use client';

import React from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * HERO SECTION TALBEROS
 * Open Source MIT: Librería avanzada de tablas con experiencia Excel.
 * Muestra un gran título, una descripción breve y un botón para ver la demo o componente principal.
 */
export default function HeroSectionTalberos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="section"
      id="hero-section"
      sx={{
        height: '90vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)',
        color: '#FFFFFF',
        px: 2,
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant={isMobile ? 'h3' : 'h1'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Talberos
        </Typography>
        <Typography
          variant={isMobile ? 'body1' : 'h5'}
          sx={{ mb: 4, maxWidth: '700px', mx: 'auto', color: '#ddd' }}
        >
          Open Source MIT: la librería avanzada de tablas para React con experiencia Excel.
          Ofrece filtrado, ordenamiento, edición en vivo, exportación a XLSX y más,
          sin costos de licencia y con total libertad de personalización.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FF00AA',
            color: '#FFFFFF',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            '&:hover': { backgroundColor: '#E60099' },
          }}
          href="/init"
        >
          Ver demo principal
        </Button>
      </motion.div>
    </Box>
  );
}
