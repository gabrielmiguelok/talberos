"use client";

/**
 * MIT License
 * -----------
 * Archivo: /components/landing/TalberosSection.js
 *
 * DESCRIPCIÓN:
 *   - Sección que muestra la librería Talberos en acción con ejemplos de tablas
 *     en modo oscuro y en modo claro.
 *   - Incluye ejemplos de filtrado, ordenamiento y más, usando el componente <CustomTable>.
 *   - Presenta un botón con icono animado para desplazarse hacia la siguiente sección.
 *
 * OBJETIVO:
 *   - Demostrar la versatilidad de Talberos y ofrecer un medio visualmente atractivo
 *     para que el usuario continúe explorando la página.
 *   - Evitar duplicaciones de código y aplicar buenas prácticas SOLID.
 *
 * PRINCIPIOS SOLID:
 *   - Single Responsibility Principle (SRP): Cada subcomponente (Title, Description, TableCard)
 *     tiene su responsabilidad definida, y esta sección únicamente los orquesta.
 *   - Open/Closed Principle (OCP): Se facilita la extensión al poder añadir más tarjetas o
 *     secciones sin cambiar el comportamiento central del componente.
 *   - Liskov Substitution Principle (LSP): No aplicable de forma directa, aunque se respeta
 *     la interoperabilidad al usar props y componentes intercambiables.
 *   - Interface Segregation Principle (ISP): Cada componente maneja sus propias props sin
 *     exigir propiedades innecesarias.
 *   - Dependency Inversion Principle (DIP): El componente no depende de detalles concretos
 *     de implementación de otros componentes (por ejemplo, <CustomTable> se inyecta).
 *
 * LICENCIA:
 *   - Este código se ofrece con fines educativos bajo licencia MIT.
 */

import React from "react";
import { Box, Grid, Paper, Button } from "@mui/material";
import { Zoom } from "react-awesome-reveal";
import Tilt from "react-parallax-tilt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

// Importaciones de CustomTable, data y definición de columnas
import dataArray from "../../data/registrosData.json";
import fieldsDefinition from "../CustomTable/FieldsDefinition";
import { buildColumnsFromDefinition } from "../CustomTable/CustomTableColumnsConfig";
import CustomTable from "../CustomTable";

/* ==========================================================================
   1) COMPONENTES AUXILIARES (Title, Description, TableCard)
   ========================================================================== */

/**
 * Componente que renderiza un título con estilos base.
 */
function Title({
  text,
  variant = "h2",
  align = "center",
  fontWeight = "bold",
  color = "#FFF",
  marginBottom = 2
}) {
  return (
    <Box
      component="h2"
      sx={{
        fontSize: variant === "h6" ? "1.25rem" : "2rem",
        textAlign: align,
        fontWeight,
        color,
        mb: marginBottom
      }}
    >
      {text}
    </Box>
  );
}

/**
 * Componente que renderiza un párrafo con estilos base para descripciones.
 */
function Description({
  text,
  align = "center",
  color = "#FFF",
  maxWidth = "auto",
  marginX = "auto",
  marginBottom = 2
}) {
  return (
    <Box
      component="p"
      sx={{
        textAlign: align,
        color,
        maxWidth,
        mx: marginX,
        mb: marginBottom,
        lineHeight: 1.7
      }}
    >
      {text}
    </Box>
  );
}

/**
 * Componente que encapsula la tabla en una tarjeta con estilos predefinidos
 * para el modo Light o Dark.
 */
function TableCard({ title, titleColor, data, columnsDef, themeMode }) {
  const PAPER_ELEVATION = 6;
  const PAPER_BORDER_RADIUS = 0;
  const PAPER_HOVER_EFFECT = {
    transition: "transform 0.2s ease-out",
    "&:hover": {}
  };
  const TABLE_MAX_HEIGHT = 300;
  const PAPER_LIGHT_BG = "#f7f7f7";
  const PAPER_DARK_BG = "#242424";

  return (
    <Paper
      elevation={PAPER_ELEVATION}
      sx={{
        p: 3,
        borderRadius: PAPER_BORDER_RADIUS,
        backgroundColor: themeMode === "dark" ? PAPER_DARK_BG : PAPER_LIGHT_BG,
        maxWidth: 450,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        ...PAPER_HOVER_EFFECT
      }}
    >
      <Title text={title} variant="h6" color={titleColor} marginBottom={2} />
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

/* ==========================================================================
   2) ESTILOS REUTILIZABLES
   ========================================================================== */

/**
 * Estilos principales para el botón de scroll:
 * - Fondo semi-transparente, icono animado de rebote, y hover con opacidad total.
 */
const scrollButtonStyles = {
  // Fondo semitransparente para ver ligeramente el contenido detrás
  backgroundColor: "rgba(255, 68, 196, 0.2)",
  backdropFilter: "blur(2px)",
  border: "1px solid #FF44C4",
  color: "#FFF",
  fontWeight: "bold",
  borderRadius: "30px",
  p: 1.5,
  minWidth: "auto",
  boxShadow: 3,
  cursor: "pointer",
  transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
  // Ajustamos opacidad inicial
  opacity: 0.8,
  "&:hover": {
    opacity: 1,
    backgroundColor: "rgba(255, 68, 196, 0.3)"
  },

  // Animación de rebote para el icono
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const iconAnimationStyles = {
  "@keyframes arrowBounce": {
    "0%, 20%, 50%, 80%, 100%": {
      transform: "translateY(0)"
    },
    "40%": {
      transform: "translateY(5px)"
    },
    "60%": {
      transform: "translateY(3px)"
    }
  },
  animation: "arrowBounce 2s infinite",
  fontSize: "1.8rem"
};

/* ==========================================================================
   3) COMPONENTE PRINCIPAL: TalberosSection
   ========================================================================== */

/**
 * Renderiza la sección principal de Talberos con ejemplos de tablas
 * en modo claro y oscuro, junto con un botón flotante/transparente animado
 * para desplazar la vista a la siguiente sección.
 */
export default function TalberosSection() {
  // Construcción dinámica de columnas
  const columns = buildColumnsFromDefinition(fieldsDefinition);

  /**
   * Maneja el evento de scroll hacia la siguiente sección.
   */
  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <Box
      id="talberos-section"
      component="section"
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #121212 0%, #1F1F1F 100%)",
        color: "#FFF",
        display: "flex",
        flexDirection: "column",
        py: 4,
        px: { xs: 2, md: 6 },
        userSelect: "none"
      }}
    >
      <Title text="Talberos en Acción" />
      <Description
        text="Mira cómo se ve Talberos tanto en modo oscuro como en modo claro.
        Experimenta su potencia de filtrado, ordenamiento y más."
        maxWidth="700px"
      />

      {/* Contenedor escalado para mostrar componentes en tamaño reducido */}
      <Box
        sx={{
          transform: "scale(0.85)",
          transformOrigin: "top center",
          width: "100%"
        }}
      >
        {/* Sección de tablas con animaciones */}
        <Zoom cascade damping={0.1} triggerOnce>
          <Grid container spacing={6} justifyContent="center" alignItems="flex-start">
            {/* Ejemplo Dark */}
            <Grid item>
              <Tilt
                perspective={900}
                glareEnable
                glareMaxOpacity={0.15}
                style={{ height: "100%" }}
              >
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
              <Tilt
                perspective={900}
                glareEnable
                glareMaxOpacity={0.15}
                style={{ height: "100%" }}
              >
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
        </Zoom>

        {/* Botón (icónico y animado) para desplazar la vista a la siguiente sección */}
        <Box
          sx={{
            textAlign: "center",
            mt: 2,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button sx={scrollButtonStyles} onClick={handleScrollDown}>
            <KeyboardDoubleArrowDownIcon sx={iconAnimationStyles} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
