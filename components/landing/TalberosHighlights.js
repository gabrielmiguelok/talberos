"use client";
// @components/landing/TalberosHighlights.js

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/TalberosHighlights.js
 *
 * PROPÓSITO:
 *   - Presentar los aspectos clave de Talberos mediante tarjetas
 *     (icono, título, descripción y bullet points).
 *   - Ajustar tamaños, espacios y tipografías para un layout más compacto.
 *   - Mantener independencia de estilos y coherencia con la paleta global.
 *
 * LICENCIA:
 *   - Bajo licencia MIT, con fines educativos y demostrativos.
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   - SRP (Single Responsibility): Este componente solo se encarga de
 *     mostrar “aspectos destacados” de Talberos.
 *   - OCP (Open/Closed): Se pueden agregar o eliminar tarjetas en
 *     `aspectsData` sin modificar la lógica principal.
 *   - LSP/ISP: No se utilizan herencias ni interfaces engorrosas; se aprovechan
 *     componentes autoexplicativos (MUI + Framer Motion).
 *   - DIP: El contenido (datos) se inyecta de forma externa en el array `aspectsData`.
 */

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";

// Íconos de Material UI
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import SecurityIcon from "@mui/icons-material/Security";

/** ---------------------------------------------------------------------------
 * [1] CONSTANTES DE CONFIGURACIÓN GLOBAL
 * ---------------------------------------------------------------------------
 * Aquí definimos la paleta principal, duraciones de animación y demás ajustes
 * generales para este componente. Todos en formato #rrggbb y/o numeric/string.
 */
const HIGHLIGHTS_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
const HIGHLIGHTS_TEXT_COLOR = "#1F1F1F";
const HIGHLIGHTS_HEADING_COLOR = "#0d47a1";
const HIGHLIGHTS_CARD_BG = "#FFFFFF";

// Duración global de animaciones Framer Motion
const HIGHLIGHTS_MOTION_DURATION = 0.8;

// Control de márgenes/paddings de la sección principal
// (Reduce el espacio vertical total)
const SECTION_PADDING_Y_XS = 6; // en Hero se usaba 8
const SECTION_PADDING_Y_MD = 10; // en Hero se usaba 12
const SECTION_PADDING_X_XS = 2;
const SECTION_PADDING_X_MD = 6;

/** ---------------------------------------------------------------------------
 * [2] CONSTANTES PARA EL ENCABEZADO PRINCIPAL (título + descripción)
 * ---------------------------------------------------------------------------
 * Ajustar los valores para un encabezado más compacto.
 */
const SECTION_TITLE_FONT_SIZE = "2rem"; // Reducido para evitar encabezado gigantesco
const SECTION_TITLE_FONT_WEIGHT = 700;  // Equivalente a "bold"
const SECTION_TITLE_MARGIN_BOTTOM = 4;  // Ajuste vertical

const SECTION_DESC_FONT_SIZE = "0.95rem";  // Un poco más pequeño
const SECTION_DESC_LINE_HEIGHT = 1.5;      // Leve reducción de line-height
const SECTION_DESC_MAX_WIDTH = "700px";    // Reduce el ancho max
const SECTION_DESC_MARGIN_BOTTOM = 6;      // Menos separación del título

/** ---------------------------------------------------------------------------
 * [3] CONSTANTES PARA LAS TARJETAS (Cards)
 * ---------------------------------------------------------------------------
 * Reducimos un poco los tamaños tipográficos, íconos y paddings.
 */
const CARD_BG_COLOR = HIGHLIGHTS_CARD_BG;
const CARD_BORDER_RADIUS = 3;
const CARD_ELEVATION = 4;     // Menos altura de sombra
const CARD_PADDING = 2;       // Ajustamos padding interno

const CARD_ICON_FONT_SIZE = 36;    // Ícono más pequeño
const CARD_ICON_COLOR = HIGHLIGHTS_HEADING_COLOR;

const CARD_TITLE_FONT_SIZE = "1rem";  // Reducido
const CARD_TITLE_FONT_WEIGHT = 600;   // Semibold
const CARD_TITLE_MARGIN_TOP = 1.5;
const CARD_TITLE_MARGIN_BOTTOM = 1.5;

const CARD_DESC_FONT_SIZE = "0.9rem";
const CARD_DESC_LINE_HEIGHT = 1.4;
const CARD_DESC_MARGIN_BOTTOM = 2;
const CARD_DESC_COLOR = HIGHLIGHTS_TEXT_COLOR;
/** ---------------------------------------------------------------------------
 * [4] CONSTANTES PARA LAS LISTAS DE BULLET POINTS
 * ---------------------------------------------------------------------------
 * Íconos y texto ligeramente más compactos.
 */
const BULLET_ICON_COLOR = "#0d47a1";
const BULLET_ICON_FONT_SIZE = 18;
const BULLET_TEXT_FONT_SIZE = "0.88rem";

/** ---------------------------------------------------------------------------
 * [5] DATOS DE LAS TARJETAS: aspectsData
 * ---------------------------------------------------------------------------
 * Cada "aspecto" con icono, título, descripción y bullets.
 * Añadir, eliminar o modificar aquí no altera la lógica central (OCP).
 */
const aspectsData = [
  {
    title: "Licencia 100% MIT",
    icon: <SecurityIcon sx={{ fontSize: CARD_ICON_FONT_SIZE, color: CARD_ICON_COLOR }} />,
    description:
      "Talberos es completamente gratuito y open source. La comunidad puede integrarlo sin restricciones, contribuyendo a un ecosistema colaborativo.",
    bulletPoints: [
      "Uso libre en proyectos comerciales",
      "Fork y personalización sin límites",
      "Contribuciones abiertas en GitHub",
    ],
  },
  {
    title: "Estilo Excel “Real”",
    icon: <RocketLaunchIcon sx={{ fontSize: CARD_ICON_FONT_SIZE, color: CARD_ICON_COLOR }} />,
    description:
      "Integración nativa de funciones similares a Excel: filtrado avanzado, selección múltiple, edición en vivo y exportación a XLSX.",
    bulletPoints: [
      "Selección con clic+arrastre “tipo Excel”",
      "Edición en celda y validaciones",
      "Exportable a .xlsx sin librerías adicionales",
    ],
  },
  {
    title: "Modo Oscuro y Claro",
    icon: <BuildCircleIcon sx={{ fontSize: CARD_ICON_FONT_SIZE, color: CARD_ICON_COLOR }} />,
    description:
      "Permite alternar entre temas claro y oscuro con un simple toggle. Ideal para una experiencia visual adaptada a las preferencias del usuario.",
    bulletPoints: [
      "Variables CSS para colores y estilos",
      "Diseño adaptable y responsivo",
      "Punto de partida para personalizar tu branding",
    ],
  },
  {
    title: "Arquitectura Moderna",
    icon: <SecurityIcon sx={{ fontSize: CARD_ICON_FONT_SIZE, color: CARD_ICON_COLOR }} />,
    description:
      "Basado en React, Next.js y React Table. Aprovecha patrones SOLID y clean code para un desarrollo mantenible y escalable.",
    bulletPoints: [
      "Hooks especializados (useCellSelection, etc.)",
      "Fácil integración con Material UI",
      "Ejemplo con SSR en Next.js",
    ],
  },
];

/** ---------------------------------------------------------------------------
 * [6] Componente TalberosHighlights
 * ---------------------------------------------------------------------------
 * Renderiza la sección de “Aspectos Destacados” de Talberos, con un layout
 * más compacto y tipografías ajustadas, manteniendo la paleta y la coherencia.
 */
export default function TalberosHighlights() {
  return (
    <Box
      component="section"
      id="talberos-highlights"
      aria-label="Características Destacadas de Talberos"
      sx={{
        position: "relative",
        overflow: "hidden",
        background: HIGHLIGHTS_BG_GRADIENT,
        color: HIGHLIGHTS_TEXT_COLOR,
        // Ajustes verticales/horizontales reducidos
        py: { xs: SECTION_PADDING_Y_XS, md: SECTION_PADDING_Y_MD },
        px: { xs: SECTION_PADDING_X_XS, md: SECTION_PADDING_X_MD },
        textAlign: "center",
        userSelect: "none",
      }}
    >
      {/* [6.1] Encabezado principal */}
      <header>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: HIGHLIGHTS_MOTION_DURATION }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: SECTION_TITLE_FONT_SIZE,
              fontWeight: SECTION_TITLE_FONT_WEIGHT,
              color: HIGHLIGHTS_HEADING_COLOR,
              mb: SECTION_TITLE_MARGIN_BOTTOM,
            }}
          >
            Características Destacadas de Talberos
          </Typography>
          <Typography
            component="p"
            sx={{
              color: HIGHLIGHTS_TEXT_COLOR,
              fontSize: SECTION_DESC_FONT_SIZE,
              lineHeight: SECTION_DESC_LINE_HEIGHT,
              maxWidth: SECTION_DESC_MAX_WIDTH,
              mx: "auto",
              mb: SECTION_DESC_MARGIN_BOTTOM,
            }}
          >
            Descubre cómo Talberos lleva las tablas en React al siguiente nivel.
            Desde la flexibilidad de la licencia MIT hasta la experiencia
            Excel-like que tus usuarios necesitan.
          </Typography>
        </motion.div>
      </header>

      {/* [6.2] Grilla de tarjetas */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3} alignItems="stretch">
          {aspectsData.map((aspect, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <motion.div
                style={{ height: "100%" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: HIGHLIGHTS_MOTION_DURATION,
                  delay: index * 0.15,
                }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  sx={{
                    backgroundColor: CARD_BG_COLOR,
                    borderRadius: CARD_BORDER_RADIUS,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: CARD_PADDING,
                  }}
                  elevation={CARD_ELEVATION}
                >
                  {/* [6.2.1] Encabezado de la tarjeta */}
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    {aspect.icon}
                    <Typography
                      component="h3"
                      sx={{
                        mt: CARD_TITLE_MARGIN_TOP,
                        mb: CARD_TITLE_MARGIN_BOTTOM,
                        fontSize: CARD_TITLE_FONT_SIZE,
                        fontWeight: CARD_TITLE_FONT_WEIGHT,
                        color: HIGHLIGHTS_TEXT_COLOR,
                      }}
                    >
                      {aspect.title}
                    </Typography>
                  </Box>

                  {/* [6.2.2] Contenido de la tarjeta */}
                  <CardContent sx={{ flexGrow: 1, p: 0 }}>
                    <Typography
                      component="p"
                      sx={{
                        fontSize: CARD_DESC_FONT_SIZE,
                        lineHeight: CARD_DESC_LINE_HEIGHT,
                        color: CARD_DESC_COLOR,
                        mb: CARD_DESC_MARGIN_BOTTOM,
                      }}
                    >
                      {aspect.description}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {aspect.bulletPoints.map((point, i) => (
                        <ListItem key={i} disableGutters sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                            <CheckCircleOutlineIcon
                              sx={{
                                color: BULLET_ICON_COLOR,
                                fontSize: BULLET_ICON_FONT_SIZE,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: BULLET_TEXT_FONT_SIZE,
                                color: HIGHLIGHTS_TEXT_COLOR,
                              },
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

      {/* [6.3] Elementos decorativos (opcionales) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.12 }}
        transition={{ duration: 1, delay: 0.3 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "220px",
          height: "220px",
          background: `radial-gradient(circle, ${HIGHLIGHTS_HEADING_COLOR} 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.6 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "160px",
          height: "160px",
          background: `radial-gradient(circle, ${HIGHLIGHTS_HEADING_COLOR} 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
    </Box>
  );
}
