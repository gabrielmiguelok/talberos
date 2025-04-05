"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/UniqueDifferentiator.js
 *
 * DESCRIPCIÓN:
 *   - Componente que describe el valor diferencial de Talberos, enfatizando
 *     sus características únicas en la Landing Page.
 *   - Totalmente independiente en cuanto a estilos y colores, sin depender
 *     de estilos globales, pero con la misma lógica y paleta del Hero.
 *   - Se definen constantes específicas para cada subsección, facilitando
 *     su modificación sin romper la cohesión visual.
 *
 * LICENCIA:
 *   - Bajo licencia MIT, con fines educativos y demostrativos.
 */

import React from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CodeIcon from "@mui/icons-material/Code";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";

/** ---------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN GLOBALES (mismo estilo que el Hero)
 * ---------------------------------------------------------------------------*/
const UNIQUE_DIFF_BG_GRADIENT = "linear-gradient(835deg, #FFFFFF 60%, #1e88e5 180%)";
const UNIQUE_DIFF_TEXT_COLOR = "#1F1F1F";
const UNIQUE_DIFF_TITLE_COLOR = "#0d47a1";
const UNIQUE_DIFF_DESCRIPTION_COLOR = "#1F1F1F";
const UNIQUE_DIFF_CARD_BG = "#FFFFFF"; // Fondo de tarjetas
const UNIQUE_DIFF_MOTION_DURATION = 0.8;

/** ---------------------------------------------------------------------------
 * CONSTANTES PARA EL ENCABEZADO PRINCIPAL
 * ---------------------------------------------------------------------------*/
const MAIN_HEADING_FONT_SIZE = "4.5rem";
const MAIN_HEADING_FONT_WEIGHT = "bold";
const MAIN_HEADING_MARGIN_BOTTOM = 4;

const MAIN_DESC_FONT_SIZE = "1.2rem";
const MAIN_DESC_COLOR = UNIQUE_DIFF_DESCRIPTION_COLOR;
const MAIN_DESC_LINE_HEIGHT = 1.6;
const MAIN_DESC_MAX_WIDTH = "800px";
const MAIN_DESC_MARGIN_BOTTOM = 6;

/** ---------------------------------------------------------------------------
 * CONSTANTES PARA LOS BLOQUES DESTACADOS
 * ---------------------------------------------------------------------------*/
const BLOCK_CARD_BORDER_RADIUS = 3;
const BLOCK_CARD_PADDING = 3;
const BLOCK_CARD_ELEVATION = 4;

const BLOCK_ICON_FONT_SIZE = 60;
const BLOCK_ICON_COLOR = UNIQUE_DIFF_TITLE_COLOR;

const BLOCK_HEADING_FONT_SIZE = "1.2rem";
const BLOCK_HEADING_FONT_WEIGHT = "bold";
const BLOCK_HEADING_MARGIN_BOTTOM = 2;
const BLOCK_HEADING_COLOR = UNIQUE_DIFF_TEXT_COLOR;

const BLOCK_TEXT_FONT_SIZE = "0.8rem";
const BLOCK_TEXT_COLOR = UNIQUE_DIFF_TEXT_COLOR;
const BLOCK_TEXT_LINE_HEIGHT = 1.6;

/**
 * Datos de cada bloque (ícono, título y texto).
 * Aunque podrían extraerse más constantes, aquí se mantiene la data estructural.
 */
const bloquesDestacados = [
  {
    titulo: "Agilidad y Escalabilidad",
    texto: `Talberos se integra fácilmente a tu proyecto y crece contigo.
    Es rápido de implementar, pero no sacrifica un enfoque limpio y sostenible.
    Logra resultados profesionales sin enredos técnicos.`,
    icono: <RocketLaunchIcon sx={{ fontSize: BLOCK_ICON_FONT_SIZE, color: BLOCK_ICON_COLOR }} />,
  },
  {
    titulo: "Código Abierto y Mantenible",
    texto: `Al ser totalmente open source (MIT), Talberos promueve la libertad de
    adaptación y la cooperación de la comunidad. Sus principios de clean code
    garantizan estabilidad y escalabilidad a largo plazo.`,
    icono: <CodeIcon sx={{ fontSize: BLOCK_ICON_FONT_SIZE, color: BLOCK_ICON_COLOR }} />,
  },
  {
    titulo: "Seguridad Integrada",
    texto: `Incorpora buenas prácticas de seguridad desde la base, reforzando cada
    módulo para proteger tus datos. Aquí, la seguridad no es una capa adicional,
    sino parte esencial de la arquitectura.`,
    icono: <SecurityIcon sx={{ fontSize: BLOCK_ICON_FONT_SIZE, color: BLOCK_ICON_COLOR }} />,
  },
];

/** ---------------------------------------------------------------------------
 * CONSTANTES PARA LA SECCIÓN INTERMEDIA
 * ---------------------------------------------------------------------------*/
const MIDSECTION_BG_COLOR = "#FFFFFF";
const MIDSECTION_BORDER_RADIUS = 3;
const MIDSECTION_PADDING_XS = 4;
const MIDSECTION_PADDING_MD = 1;
const MIDSECTION_BOX_SHADOW = 4;
const MIDSECTION_MARGIN_TOP = 10;
const MIDSECTION_MARGIN_BOTTOM = 10;

const MIDSECTION_HEADING_FONT_SIZE = "2.1rem";
const MIDSECTION_HEADING_FONT_WEIGHT = "bold";
const MIDSECTION_HEADING_COLOR = UNIQUE_DIFF_TITLE_COLOR;
const MIDSECTION_HEADING_MARGIN_BOTTOM = 2;

const MIDSECTION_DESC_FONT_SIZE = "1rem";
const MIDSECTION_DESC_COLOR = UNIQUE_DIFF_TEXT_COLOR;
const MIDSECTION_DESC_LINE_HEIGHT = 1.7;
const MIDSECTION_DESC_MARGIN_BOTTOM = 3;

/** ---------------------------------------------------------------------------
 * CONSTANTES PARA LA SECCIÓN DE RESULTADOS
 * ---------------------------------------------------------------------------*/
const FINAL_SECTION_MARGIN_TOP = 10;
const FINAL_SECTION_MARGIN_BOTTOM = 4;
const FINAL_SECTION_TEXT_ALIGN = "center";
const FINAL_SECTION_MAX_WIDTH = "900px";

const FINAL_HEADING_FONT_SIZE = "4.2rem";
const FINAL_HEADING_FONT_WEIGHT = "bold";
const FINAL_HEADING_COLOR = UNIQUE_DIFF_TITLE_COLOR;
const FINAL_HEADING_MARGIN_BOTTOM = 3;

const FINAL_TEXT_FONT_SIZE = "2rem";
const FINAL_TEXT_COLOR = UNIQUE_DIFF_TEXT_COLOR;
const FINAL_TEXT_LINE_HEIGHT = 1.7;

/** ---------------------------------------------------------------------------
 * Componente UniqueDifferentiator
 * ---------------------------------------------------------------------------*/
export default function UniqueDifferentiator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      component="section"
      id="diferenciador-unico"
      aria-labelledby="unique-differentiator-heading"
      sx={{
        width: "100%",
        background: UNIQUE_DIFF_BG_GRADIENT,
        color: UNIQUE_DIFF_TEXT_COLOR,
        overflow: "hidden",
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* Contenedor interno para centrar contenido */}
      <Box sx={{ maxWidth: { xs: "100%", md: "1200px" }, mx: "auto" }}>
        {/* Encabezado principal */}
        <header style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: UNIQUE_DIFF_MOTION_DURATION }}
          >
            <Typography
              id="unique-differentiator-heading"
              component="h2"
              sx={{
                fontWeight: MAIN_HEADING_FONT_WEIGHT,
                mb: MAIN_HEADING_MARGIN_BOTTOM,
                color: UNIQUE_DIFF_TITLE_COLOR,
                fontSize: MAIN_HEADING_FONT_SIZE,

              }}
            >
              ¿Por qué Talberos es único?
            </Typography>
            <Typography
              component="p"
              sx={{
                color: MAIN_DESC_COLOR,
                mb: MAIN_DESC_MARGIN_BOTTOM,
                maxWidth: MAIN_DESC_MAX_WIDTH,
                mx: "auto",
                lineHeight: MAIN_DESC_LINE_HEIGHT,
                fontSize: MAIN_DESC_FONT_SIZE,
              }}
            >
              Combinamos la experiencia de una tabla Excel-like con la libertad
              de un proyecto Open Source. Talberos nace para crecer contigo y
              mantener tu código claro y seguro, incluso cuando tus datos se
              multipliquen.
            </Typography>
          </motion.div>
        </header>

        {/* Bloques destacados */}
        <Box sx={{ mb: 10 }}>
          <Grid container spacing={4} alignItems="stretch">
            {bloquesDestacados.map((bloque, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  style={{ height: "100%" }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: UNIQUE_DIFF_MOTION_DURATION,
                    delay: index * 0.2,
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: UNIQUE_DIFF_CARD_BG,
                      borderRadius: BLOCK_CARD_BORDER_RADIUS,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "center",
                      p: BLOCK_CARD_PADDING,
                    }}
                    elevation={BLOCK_CARD_ELEVATION}
                  >
                    <Box sx={{ mb: 2 }}>{bloque.icono}</Box>
                    <Typography
                      component="h3"
                      sx={{
                        fontWeight: BLOCK_HEADING_FONT_WEIGHT,
                        mb: BLOCK_HEADING_MARGIN_BOTTOM,
                        color: BLOCK_HEADING_COLOR,
                        fontSize: BLOCK_HEADING_FONT_SIZE,
                      }}
                    >
                      {bloque.titulo}
                    </Typography>
                    <Typography
                      component="p"
                      sx={{
                        color: BLOCK_TEXT_COLOR,
                        lineHeight: BLOCK_TEXT_LINE_HEIGHT,
                        fontSize: BLOCK_TEXT_FONT_SIZE,
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

        {/* Sección intermedia */}
        <Box
          component="section"
          aria-label="Enfoque centrado en calidad"
          sx={{
            mt: MIDSECTION_MARGIN_TOP,
            mb: MIDSECTION_MARGIN_BOTTOM,
            borderRadius: MIDSECTION_BORDER_RADIUS,
            p: { xs: MIDSECTION_PADDING_XS, md: MIDSECTION_PADDING_MD },
            backgroundColor: MIDSECTION_BG_COLOR,
            position: "relative",
            boxShadow: MIDSECTION_BOX_SHADOW,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: UNIQUE_DIFF_MOTION_DURATION }}
          >
            <Grid container spacing={4} alignItems="center">
              {/* Imagen decorativa solo para desktop */}
              {!isMobile && (
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    image="/logo.png"
                    alt="Talberos Advantage"
                    sx={{
                      borderRadius: 3,
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Grid>
              )}
              {/* Texto y lista de fortalezas */}
              <Grid item xs={12} md={isMobile ? 12 : 6}>
                <Typography
                  component="h3"
                  sx={{
                    fontWeight: MIDSECTION_HEADING_FONT_WEIGHT,
                    mb: MIDSECTION_HEADING_MARGIN_BOTTOM,
                    color: MIDSECTION_HEADING_COLOR,
                    fontSize: MIDSECTION_HEADING_FONT_SIZE,
                  }}
                >
                  Enfoque centrado en calidad
                </Typography>
                <Typography
                  component="p"
                  sx={{
                    mb: MIDSECTION_DESC_MARGIN_BOTTOM,
                    color: MIDSECTION_DESC_COLOR,
                    fontSize: MIDSECTION_DESC_FONT_SIZE,
                    lineHeight: MIDSECTION_DESC_LINE_HEIGHT,
                  }}
                >
                  Talberos está dirigido a quienes buscan un producto sólido
                  desde la base: código limpio, modularidad, escalabilidad y
                  seguridad sin rodeos.
                </Typography>
                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                      <CheckCircleOutlineIcon
                        sx={{ color: UNIQUE_DIFF_TITLE_COLOR }}
                        aria-hidden="true"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Clean Code y Documentación Clara"
                      primaryTypographyProps={{
                        sx: { color: MIDSECTION_DESC_COLOR },
                      }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                      <CheckCircleOutlineIcon
                        sx={{ color: UNIQUE_DIFF_TITLE_COLOR }}
                        aria-hidden="true"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Arquitectura Modular (Principios SOLID)"
                      primaryTypographyProps={{
                        sx: { color: MIDSECTION_DESC_COLOR },
                      }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                      <CheckCircleOutlineIcon
                        sx={{ color: UNIQUE_DIFF_TITLE_COLOR }}
                        aria-hidden="true"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Experiencia Excel-like y Flexibilidad React"
                      primaryTypographyProps={{
                        sx: { color: MIDSECTION_DESC_COLOR },
                      }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                      <CheckCircleOutlineIcon
                        sx={{ color: UNIQUE_DIFF_TITLE_COLOR }}
                        aria-hidden="true"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Seguridad y Rendimiento en Cada Capa"
                      primaryTypographyProps={{
                        sx: { color: MIDSECTION_DESC_COLOR },
                      }}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* Resultado final */}
        <Box
          component="section"
          aria-label="Resultado de elegir Talberos"
          sx={{
            mt: FINAL_SECTION_MARGIN_TOP,
            mb: FINAL_SECTION_MARGIN_BOTTOM,
            textAlign: FINAL_SECTION_TEXT_ALIGN,
            maxWidth: FINAL_SECTION_MAX_WIDTH,
            mx: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: UNIQUE_DIFF_MOTION_DURATION,
              delay: 0.3,
            }}
          >
            <Typography
              component="h3"
              sx={{
                fontWeight: FINAL_HEADING_FONT_WEIGHT,
                mb: FINAL_HEADING_MARGIN_BOTTOM,
                color: FINAL_HEADING_COLOR,
                fontSize: FINAL_HEADING_FONT_SIZE,
              }}
            >
              El resultado de elegir Talberos
            </Typography>
            <Typography
              component="p"
              sx={{
                color: FINAL_TEXT_COLOR,
                fontSize: FINAL_TEXT_FONT_SIZE,
                lineHeight: FINAL_TEXT_LINE_HEIGHT,
                px: { xs: 2, md: 0 },
              }}
            >
              Una librería verdaderamente diferenciada:{" "}
              <em>abierta, escalable y con seguridad incorporada</em>.
              Olvídate de parches improvisados: empieza con Talberos y ahorra
              tiempo, dinero y dolores de cabeza en el futuro.
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
