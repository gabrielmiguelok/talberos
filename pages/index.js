'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';

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
const DESCRIPTION_COLOR = '#FFFFFF';        // Color de la descripción
const DESCRIPTION_MAX_WIDTH = '1200px';      // Máximo ancho del texto
const DESCRIPTION_LINE_HEIGHT = 1.7;        // Altura de línea
const DESCRIPTION_MARGIN_BOTTOM = 4;        // Margen inferior
// Para fuentes responsivas puedes usar un objeto o un string fijo
const DESCRIPTION_FONT_SIZE = { xs: '1rem', md: '1.7rem' };

// Estilos para el contenedor principal
const MAIN_BACKGROUND = 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)';
const MAIN_COLOR = '#FFF';
const MAIN_PADDING_Y = 10; // padding vertical
const MAIN_PADDING_X = { xs: 2, md: 6 }; // padding horizontal responsivo

// Estilos para el contenedor de la tabla (Paper)
const PAPER_BORDER_RADIUS = 3;
const PAPER_ELEVATION = 6;
const PAPER_HOVER_EFFECT = {
  transition: 'transform 0.2s ease-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
};

// Estilos para la tabla misma
const TABLE_MAX_HEIGHT = 400;

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
  maxWidth = '800px',
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
    <Box
      sx={{
        minHeight: '100vh',
        background: MAIN_BACKGROUND,
        color: MAIN_COLOR,
        py: MAIN_PADDING_Y,
        px: MAIN_PADDING_X,
        userSelect: 'none',
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

      <Zoom cascade damping={0.1} triggerOnce>
        <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
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
                  text="Versión Clara"
                  variant="h6"
                  color="#333"
                  marginBottom={2}
                />
                <Box sx={{ maxHeight: TABLE_MAX_HEIGHT, overflow: 'auto' }}>
                  <CustomTable
                    data={dataArray}
                    columnsDef={columns}
                    themeMode="light"
                  />
                </Box>
              </Paper>
            </Tilt>
          </Grid>

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
                  text="Versión Oscura"
                  variant="h6"
                  color="#FF00AA"
                  marginBottom={2}
                />
                <Box sx={{ maxHeight: TABLE_MAX_HEIGHT, overflow: 'auto' }}>
                  <CustomTable
                    data={dataArray}
                    columnsDef={columns}
                    themeMode="dark"
                  />
                </Box>
              </Paper>
            </Tilt>
          </Grid>
        </Grid>
      </Zoom>
    </Box>
  );
}
