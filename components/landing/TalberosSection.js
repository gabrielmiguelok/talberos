"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/TalberosSection.js
 *
 * DESCRIPCIÓN:
 *   - Sección que muestra la librería Talberos en acción (tablas en modo oscuro y claro).
 *   - Incluye ejemplos de filtrado/ordenamiento y un botón animado para scroll
 *     hacia la siguiente sección.
 *
 * LICENCIA:
 *   - Código ofrecido con fines educativos bajo licencia MIT.
 */

import React from "react";
import { Box, Grid, Paper, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Zoom } from "react-awesome-reveal";
import Tilt from "react-parallax-tilt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

// Componentes y configuración para la tabla
import dataArray from "../../data/registrosData.json";
import fieldsDefinition from "../CustomTable/FieldsDefinition";
import { buildColumnsFromDefinition } from "../CustomTable/CustomTableColumnsConfig";
import CustomTable from "../CustomTable";

/** ---------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN (Colores, tamaños, etc.)
 * ---------------------------------------------------------------------------*/
const SECTION_BG_GRADIENT = "linear-gradient(135deg, #121212 0%, #1F1F1F 100%)";
const SECTION_TEXT_COLOR = "#FFFFFF";
const SECTION_PADDING_Y = 4;

const TITLE_COLOR = "#FFF";
const DESCRIPTION_COLOR = "#FFF";
const DESCRIPTION_MAX_WIDTH = "700px";

const PAPER_LIGHT_BG = "#f7f7f7";
const PAPER_DARK_BG = "#242424";

const SCROLL_BUTTON_BG = "rgba(255, 68, 196, 0.2)";
const SCROLL_BUTTON_BG_HOVER = "rgba(255, 68, 196, 0.3)";
const SCROLL_BUTTON_BORDER = "1px solid #FF44C4";
const SCROLL_ICON_COLOR = "#FFF";

/**
 * Tamaños de tipografía en rem para un mayor control,
 * en lugar de rely on h2/h6 de MUI.
 */
const TITLE_FONT_SIZE = "2rem";
const SUBTITLE_FONT_SIZE = "1rem";

/**
 * Título genérico con estilo personalizable
 */
function Title({
  text = "",
  color = TITLE_COLOR,
  fontSize = TITLE_FONT_SIZE,
  marginBottom = 2,
}) {
  return (
    <Box
      component="h2"
      sx={{
        fontSize,
        textAlign: "center",
        fontWeight: "bold",
        color,
        mb: marginBottom,
      }}
    >
      {text}
    </Box>
  );
}

/**
 * Descripción genérica (párrafo)
 */
function Description({
  text = "",
  color = DESCRIPTION_COLOR,
  maxWidth = DESCRIPTION_MAX_WIDTH,
  marginBottom = 2,
}) {
  return (
    <Box
      component="p"
      sx={{
        textAlign: "center",
        color,
        maxWidth,
        mx: "auto",
        mb: marginBottom,
        lineHeight: 1.7,
        fontSize: SUBTITLE_FONT_SIZE,
      }}
    >
      {text}
    </Box>
  );
}

/**
 * Componente TableCard:
 *  - Muestra un título y una tabla (<CustomTable>) dentro de un <Paper>.
 */
function TableCard({
  title = "Dark",
  titleColor = "#FF00AA",
  data = [],
  columnsDef = [],
  themeMode = "dark",
}) {
  const PAPER_ELEVATION = 6;
  const TABLE_MAX_HEIGHT = 300;

  return (
    <Paper
      elevation={PAPER_ELEVATION}
      sx={{
        p: 3,
        borderRadius: 0,
        backgroundColor: themeMode === "dark" ? PAPER_DARK_BG : PAPER_LIGHT_BG,
        maxWidth: 450,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        "&:hover": {
          transition: "transform 0.2s ease-out",
        },
      }}
    >
      <Box
        component="h3"
        sx={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          mb: 2,
          color: titleColor,
        }}
      >
        {title}
      </Box>
      <Box sx={{ maxHeight: TABLE_MAX_HEIGHT, overflow: "hidden" }}>
        <CustomTable
          data={data}
          columnsDef={columnsDef}
          themeMode={themeMode}
          containerHeight={`${TABLE_MAX_HEIGHT}px`}
        />
      </Box>
    </Paper>
  );
}

export default function TalberosSection() {
  const theme = useTheme();
  // Detección de preferencia de animación
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const columns = buildColumnsFromDefinition(fieldsDefinition);

  /**
   * Maneja el evento de scroll a la siguiente sección
   */
  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <Box
      id="talberos-section"
      component="section"
      aria-labelledby="talberos-section-heading"
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: SECTION_BG_GRADIENT,
        color: SECTION_TEXT_COLOR,
        display: "flex",
        flexDirection: "column",
        py: SECTION_PADDING_Y,
        px: { xs: 2, md: 6 },
        userSelect: "none",
      }}
    >
      <Title text="Talberos en Acción" />
      <Description
        text="Mira cómo se ve Talberos tanto en modo oscuro como en modo claro.
        Experimenta su potencia de filtrado, ordenamiento y más."
      />

      {/* Escala los ejemplos ligeramente */}
      <Box
        sx={{
          transform: "scale(0.85)",
          transformOrigin: "top center",
          width: "100%",
        }}
      >
        {!reduceMotion ? (
          <Zoom cascade damping={0.1} triggerOnce>
            <TablesGrid columns={columns} />
          </Zoom>
        ) : (
          <TablesGrid columns={columns} />
        )}

        {/* Botón flotante para scroll a la siguiente sección */}
        <Box sx={{ textAlign: "center", mt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleScrollDown}
            sx={{
              backgroundColor: SCROLL_BUTTON_BG,
              backdropFilter: "blur(2px)",
              border: SCROLL_BUTTON_BORDER,
              color: SCROLL_ICON_COLOR,
              fontWeight: "bold",
              borderRadius: "30px",
              p: 1.5,
              minWidth: "auto",
              boxShadow: 3,
              cursor: "pointer",
              transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
              opacity: 0.8,
              "&:hover": {
                opacity: 1,
                backgroundColor: SCROLL_BUTTON_BG_HOVER,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyboardDoubleArrowDownIcon
              sx={{
                "@keyframes arrowBounce": {
                  "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
                  "40%": { transform: "translateY(5px)" },
                  "60%": { transform: "translateY(3px)" },
                },
                animation: "arrowBounce 2s infinite",
                fontSize: "1.8rem",
              }}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Subcomponente que renderiza ambas tablas (dark y light).
 */
function TablesGrid({ columns }) {
  return (
    <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
      {/* Ejemplo Dark */}
      <Grid item>
        <Tilt perspective={900} glareEnable glareMaxOpacity={0.15} style={{ height: "100%" }}>
          <TableCard
            title="Dark"
            titleColor="#FF00AA"
            data={dataArray}
            columnsDef={columns}
            themeMode="dark"
          />
        </Tilt>
      </Grid>
      {/* Ejemplo Light */}
      <Grid item>
        <Tilt perspective={900} glareEnable glareMaxOpacity={0.15} style={{ height: "100%" }}>
          <TableCard
            title="Light"
            titleColor="#333"
            data={dataArray}
            columnsDef={columns}
            themeMode="light"
          />
        </Tilt>
      </Grid>
    </Grid>
  );
}
