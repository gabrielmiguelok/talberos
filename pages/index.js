'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useMediaQuery,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';
import Link from 'next/link'; // Importa Link para navegación interna y externa

// Importaciones de tu tabla y definición de campos
import dataArray from '../data/registrosData.json';
import fieldsDefinition from '../components/CustomTable/FieldsDefinition';
import { buildColumnsFromDefinition } from '../components/CustomTable/CustomTableColumnsConfig';
import CustomTable from '../components/CustomTable';

/* ================================================
   VARIABLES DE ESTILO
   - Ajusta aquí los tamaños, colores, etc.
   ================================================= */

// Estilos para el "Título"
const TITLE_VARIANT_DESKTOP = 'h1';         // Variant que usarás en desktop
const TITLE_VARIANT_MOBILE = 'h2';          // Variant que usarás en mobile
const TITLE_COLOR = '#FF00AA';              // Color principal del título
const TITLE_FONT_WEIGHT = 'bold';           // Bold, normal, etc.
const TITLE_MARGIN_BOTTOM = 2;              // Margen inferior para el título

// Estilos para la "Descripción"
const DESCRIPTION_COLOR = '#FFFFFF';
const DESCRIPTION_MAX_WIDTH = '1200px';
const DESCRIPTION_LINE_HEIGHT = 1.7;
const DESCRIPTION_MARGIN_BOTTOM = 4;
const DESCRIPTION_FONT_SIZE = { xs: '1rem', md: '1.7rem' };

// Estilos para el contenedor principal (el que abarca toda la vista)
const MAIN_BACKGROUND = 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)';
const MAIN_COLOR = '#FFF';
const MAIN_PADDING_Y = 10; // padding vertical (en múltiplos de 8px)
const MAIN_PADDING_X = { xs: 2, md: 6 }; // padding horizontal responsivo

// Estilos para el contenedor de la tabla (Paper)
const PAPER_BORDER_RADIUS = 0;
const PAPER_ELEVATION = 6;
const PAPER_HOVER_EFFECT = {
  transition: 'transform 0.2s ease-out',
  '&:hover': {},
};

// Altura máxima que queremos para cada tabla
const TABLE_MAX_HEIGHT = 300;

// Versiones de colores para cada Paper
const PAPER_LIGHT_BG = '#f7f7f7';
const PAPER_DARK_BG = '#242424';

/* ================================================
   COMPONENTE DE TÍTULO
   ================================================= */
function Title({
  text,
  variant = 'h2',
  align = 'center',
  fontWeight = 'bold',
  color = '#FFF',
  marginBottom = 2,
}) {
  return (
    <Typography
      variant={variant}
      align={align}
      fontWeight={fontWeight}
      sx={{
        mb: marginBottom,
        color,
      }}
    >
      {text}
    </Typography>
  );
}

/* ================================================
   COMPONENTE DE DESCRIPCIÓN
   ================================================= */
function Description({
  text,
  align = 'center',
  color = '#FFF',
  maxWidth = 'auto',
  marginX = 'auto',
  lineHeight = 1.7,
  fontSize = '1rem',
  marginBottom = 2,
}) {
  return (
    <Typography
      align={align}
      sx={{
        mb: marginBottom,
        color,
        maxWidth,
        mx: marginX,
        lineHeight,
        fontSize,
      }}
    >
      {text}
    </Typography>
  );
}

/* ================================================
   COMPONENTE PRINCIPAL
   ================================================= */
export default function IndexTalberos() {
  const columns = buildColumnsFromDefinition(fieldsDefinition);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    // Contenedor principal que abarca toda la pantalla
    <Box
      sx={{
        // Ocupar toda la ventana y no mostrar scroll global
        height: '100vh',
        overflow: 'hidden',
        background: MAIN_BACKGROUND,
        color: MAIN_COLOR,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Contenedor interno para el contenido; sí puede scrollear si excede la altura */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: MAIN_PADDING_Y,
          px: MAIN_PADDING_X,
        }}
      >
        {/* ENCABEZADO: TÍTULO */}
        <Title
          text="Talberos"
          variant={isMobile ? TITLE_VARIANT_MOBILE : TITLE_VARIANT_DESKTOP}
          color={TITLE_COLOR}
          fontWeight={TITLE_FONT_WEIGHT}
          marginBottom={TITLE_MARGIN_BOTTOM}
        />

        {/* DESCRIPCIÓN */}
        <Description
          text={`Talberos es una librería Open Source (MIT) que ofrece tablas avanzadas en React
          con una experiencia similar a Excel. Permite filtrado, ordenamiento, edición en vivo,
          exportación a XLSX y más, sin costos de licencia y con total libertad de
          personalización.`}
          color={DESCRIPTION_COLOR}
          maxWidth={DESCRIPTION_MAX_WIDTH}
          lineHeight={DESCRIPTION_LINE_HEIGHT}
          fontSize={DESCRIPTION_FONT_SIZE}
          marginBottom={DESCRIPTION_MARGIN_BOTTOM}
        />

        {/* GRID DE TABLEROS */}
        <Zoom cascade damping={0.1} triggerOnce>
          <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
            {/* TABLERO VERSIÓN OSCURA */}
            <Grid item>
              <Tilt perspective={900} glareEnable glareMaxOpacity={0.15} style={{ height: '100%' }}>
                <Paper
                  elevation={PAPER_ELEVATION}
                  sx={{
                    p: 3,
                    borderRadius: PAPER_BORDER_RADIUS,
                    backgroundColor: PAPER_DARK_BG,
                    maxWidth: 450,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    ...PAPER_HOVER_EFFECT,
                  }}
                >
                  <Title
                    text="Dark"
                    variant="h6"
                    color="#FF00AA"
                    marginBottom={2}
                  />
                  {/* Igualmente, scroll interno sólo para la tabla */}
                  <Box sx={{ maxHeight: TABLE_MAX_HEIGHT, overflow: 'hidden' }}>
                    <CustomTable
                      data={dataArray}
                      columnsDef={columns}
                      themeMode="dark"
                      containerHeight={`${TABLE_MAX_HEIGHT}px`}
                    />
                  </Box>
                </Paper>
              </Tilt>
            </Grid>
          {/* TABLERO VERSIÓN CLARA */}
            <Grid item>
              <Tilt perspective={900} glareEnable glareMaxOpacity={0.15} style={{ height: '100%' }}>
                <Paper
                  elevation={PAPER_ELEVATION}
                  sx={{
                    p: 3,
                    borderRadius: PAPER_BORDER_RADIUS,
                    backgroundColor: PAPER_LIGHT_BG,
                    maxWidth: 450,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    ...PAPER_HOVER_EFFECT,
                  }}
                >
                  <Title
                    text="Light"
                    variant="h6"
                    color="#333"
                    marginBottom={2}
                  />
                  {/* Scroll interno sólo para la tabla => pasamos containerHeight */}
                  <Box sx={{ maxHeight: TABLE_MAX_HEIGHT, overflow: 'hidden' }}>
                    <CustomTable
                      data={dataArray}
                      columnsDef={columns}
                      themeMode="light"
                      containerHeight={`${TABLE_MAX_HEIGHT}px`}
                    />
                  </Box>
                </Paper>
              </Tilt>
            </Grid>
          </Grid>
        </Zoom>

        {/* BOTONES */}
        <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {/* Botón para /init */}
          <Link href="/init" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{
                background: '#FF00AA',
                color: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '5px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 7,
                transition: 'transform 0.2s ease-out',
                '&:hover': {
                  background: '#FF44C4',
                  boxShadow: 7,
                },
              }}
            >
              Ampliar
            </Button>
          </Link>

          {/* Botón externo al repositorio de Talberos */}
          <Button
            variant="contained"
            component="a"
            href="https://github.com/gabrielmiguelok/talberos"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              background: '#FF00AA',
              color: '#FFFFFF',
              fontWeight: 'bold',
              borderRadius: '5px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 7,
              transition: 'transform 0.2s ease-out',
              '&:hover': {
                background: '#FF44C4',
                boxShadow: 7,
              },
            }}
          >
            Repositorio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
