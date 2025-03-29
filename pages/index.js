'use client';

/**
 * Archivo: /pages/index.js
 * Licencia: MIT
 *
 * DESCRIPCIÓN:
 *   - Página de inicio que muestra un ejemplo completo de uso de `<CustomTable />`
 *     (en modo claro y oscuro) dentro de un layout responsivo, con títulos y descripciones.
 *   - Presenta componentes auxiliares (Title, Description) y aprovecha librerías
 *     de animación y parallax (Zoom, Tilt).
 *
 * OBJETIVO:
 *   - Servir como **demostración** de distintos elementos de UI:
 *     1. Título y texto descriptivo animados (usando react-awesome-reveal).
 *     2. Vistas de tabla en modo oscuro y claro, usando `<CustomTable />`.
 *     3. Botones de navegación a otras secciones o repositorios.
 *
 * PRINCIPIOS SOLID:
 *   - SRP (Single Responsibility Principle):
 *     Este archivo se centra en la **presentación** (título, descripción, layout)
 *     y en proveer un ejemplo de `<CustomTable />` con dos modos de tema.
 *     No maneja lógica interna de la tabla (encapsulada en `<CustomTable />`).
 *
 *   - DIP (Dependency Inversion Principle):
 *     - Inyecta datos y configuración de la tabla (dataArray, columnsDef, themeMode)
 *       directamente en `<CustomTable />`.
 *     - Permite intercambiar estos datos/props sin modificar el código interno
 *       de la tabla ni de este archivo.
 *
 * @version 2.0
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useMediaQuery,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Zoom } from 'react-awesome-reveal';
import Tilt from 'react-parallax-tilt';
import Link from 'next/link'; // Para navegación interna (Next.js) o externa

// Importaciones relacionadas a la tabla
import dataArray from '../data/registrosData.json';
import fieldsDefinition from '../components/CustomTable/FieldsDefinition';
import { buildColumnsFromDefinition } from '../components/CustomTable/CustomTableColumnsConfig';
import CustomTable from '../components/CustomTable';

/* ==========================================================================
   1) CONFIGURACIONES DE ESTILO Y PROPS
   - Variables (const) para personalizar colores, tamaños de fuente, etc.
   ========================================================================== */

// Estilos para el título principal
const TITLE_VARIANT_DESKTOP = 'h1'; // Variant tipográfica en pantallas grandes
const TITLE_VARIANT_MOBILE = 'h2';  // Variant en pantallas pequeñas
const TITLE_COLOR = '#FF00AA';      // Color principal del título
const TITLE_FONT_WEIGHT = 'bold';   // "bold", "normal", etc.
const TITLE_MARGIN_BOTTOM = 2;      // Margen inferior (espaciado) en múltiplos de 8px

// Estilos para el texto descriptivo
const DESCRIPTION_COLOR = '#FFFFFF';
const DESCRIPTION_MAX_WIDTH = '100%';
const DESCRIPTION_LINE_HEIGHT = 1.7;
const DESCRIPTION_MARGIN_BOTTOM = 4;
const DESCRIPTION_FONT_SIZE = { xs: '1rem', md: '1.7rem' };

// Estilos para el contenedor principal (background, colores)
const MAIN_BACKGROUND = 'linear-gradient(135deg, #121212 0%, #1F1F1F 100%)';
const MAIN_COLOR = '#FFF';
const MAIN_PADDING_Y = 10; // padding vertical en múltiplos de 8px
const MAIN_PADDING_X = { xs: 2, md: 6 }; // padding horizontal responsivo

// Configuración para el contenedor de la tabla
const PAPER_BORDER_RADIUS = 0;
const PAPER_ELEVATION = 6;
const PAPER_HOVER_EFFECT = {
  transition: 'transform 0.2s ease-out',
  '&:hover': {},
};

// Altura máxima de la tabla (ejemplo)
const TABLE_MAX_HEIGHT = 300;

// Colores específicos para la versión light/dark del Paper
const PAPER_LIGHT_BG = '#f7f7f7';
const PAPER_DARK_BG = '#242424';

/* ==========================================================================
   2) COMPONENTES REUTILIZABLES
   - Title: Muestra un título tipográfico
   - Description: Muestra texto descriptivo con estilo configurable
   ========================================================================== */

/**
 * Componente Title
 * --------------------------------------------------------------------------
 * Muestra un título tipográfico con un color, tamaño y peso personalizado.
 *
 * @param {object} props
 * @param {string} props.text - El texto a mostrar en el título.
 * @param {string} [props.variant='h2'] - Variante tipográfica (material-ui),
 *   por ejemplo, 'h1', 'h2', 'h3', 'h4', etc.
 * @param {string} [props.align='center'] - Alineación del texto: 'left', 'center', 'right'.
 * @param {string|number} [props.fontWeight='bold'] - Peso de la fuente, p. ej. 'bold', 400, 700, etc.
 * @param {string} [props.color='#FFF'] - Color del texto en formato hex o variable CSS.
 * @param {number} [props.marginBottom=2] - Espaciado inferior (se multiplica por 8px).
 * @returns {JSX.Element}
 */
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

/**
 * Componente Description
 * --------------------------------------------------------------------------
 * Muestra texto de descripción con maxWidth y fontSize personalizables.
 *
 * @param {object} props
 * @param {string} props.text - El contenido textual.
 * @param {string} [props.align='center'] - Alineación del texto.
 * @param {string} [props.color='#FFF'] - Color del texto.
 * @param {string|number} [props.maxWidth='auto'] - Ancho máximo del contenedor.
 * @param {string|number} [props.marginX='auto'] - Margen horizontal (por defecto centrado).
 * @param {number} [props.lineHeight=1.7] - Altura de línea.
 * @param {string|object} [props.fontSize='1rem'] - Tamaño de fuente (puede ser responsivo).
 * @param {number} [props.marginBottom=2] - Espacio inferior (en múltiplos de 8px).
 * @returns {JSX.Element}
 */
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

/* ==========================================================================
   3) COMPONENTE PRINCIPAL: IndexTalberos
   - Renderiza el título, descripción, y dos ejemplos de <CustomTable /> en
     modo oscuro y claro, dentro de <Paper /> con parallax y animación.
   ========================================================================== */

/**
 * IndexTalberos
 * --------------------------------------------------------------------------
 * Página principal que muestra:
 *   1. Un Título (Talberos).
 *   2. Una Descripción explicando la librería.
 *   3. Dos tablas <CustomTable />, una en modo "dark" y otra en "light",
 *      cada una contenida en un <Paper> animado con Tilt y Zoom.
 *   4. Botones para navegar hacia "/init" o hacia el repositorio de GitHub.
 *
 * @returns {JSX.Element}
 */
export default function IndexTalberos() {
  // 1) Construir columnas para la tabla
  const columns = buildColumnsFromDefinition(fieldsDefinition);

  // 2) Hooks de Material UI
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Se usa para decidir el variant del título: h1 o h2.

  // 3) Render principal
  return (
    <Box
      sx={{
        /* Contenedor que ocupa la ventana y oculta scroll global */
        height: '100vh',
        overflow: 'hidden',
        background: MAIN_BACKGROUND,
        color: MAIN_COLOR,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Contenedor interno que sí puede scrollear si el contenido excede la altura */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: MAIN_PADDING_Y,
          px: MAIN_PADDING_X,
        }}
      >
        {/* Título principal */}
        <Title
          text="Talberos"
          variant={isMobile ? TITLE_VARIANT_MOBILE : TITLE_VARIANT_DESKTOP}
          color={TITLE_COLOR}
          fontWeight={TITLE_FONT_WEIGHT}
          marginBottom={TITLE_MARGIN_BOTTOM}
        />

        {/* Descripción de la librería / proyecto */}
        <Description
          text={`Talberos es una librería Open Source (MIT) que ofrece tablas avanzadas en React,
          con una experiencia similar a Excel. Permite filtrado, ordenamiento, edición en vivo,
          exportación a XLSX y más, sin costos de licencia y con total libertad de
          personalización.`}
          color={DESCRIPTION_COLOR}
          maxWidth={DESCRIPTION_MAX_WIDTH}
          lineHeight={DESCRIPTION_LINE_HEIGHT}
          fontSize={DESCRIPTION_FONT_SIZE}
          marginBottom={DESCRIPTION_MARGIN_BOTTOM}
        />

        {/* Sección contenedora de los "Tableros" (Grid con animación Zoom) */}
        <Zoom cascade damping={0.1} triggerOnce>
          <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
            {/*
              TABLERO VERSIÓN OSCURA
              Envuelto en "Tilt" para efecto parallax y "Paper" para contenedor visual
            */}
            <Grid item>
              <Tilt
                perspective={900}
                glareEnable
                glareMaxOpacity={0.15}
                style={{ height: '100%' }}
              >
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
                  {/* Contenedor de la tabla con scroll interno */}
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

            {/*
              TABLERO VERSIÓN CLARA
              De forma similar, pero con un fondo claro en el <Paper />
            */}
            <Grid item>
              <Tilt
                perspective={900}
                glareEnable
                glareMaxOpacity={0.15}
                style={{ height: '100%' }}
              >
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
                  {/* Tabla en modo "light" con altura fija */}
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

        {/* BOTONES FINALES: uno para /init y otro para el repositorio de GitHub */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}
        >
          {/* Botón de navegación interna (Next.js) a "/init" */}
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

          {/* Botón para ir al repositorio en GitHub (enlace externo) */}
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
