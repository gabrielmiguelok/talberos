"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/HeroTalberos.js
 *
 * DESCRIPCIÓN:
 *   - Sección principal (Hero) de la Landing Page de Talberos.
 *   - Se implementan constantes para colores, tamaños y spacing, facilitando
 *     cambios globales y asegurando un código más claro.
 *
 * LICENCIA:
 *   - Código ofrecido bajo licencia MIT, para fines educativos.
 */

import React from "react";
import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

/** ---------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN (Colores, tamaños, etc.)
 * ---------------------------------------------------------------------------*/
const HERO_BG_GRADIENT = "linear-gradient(135deg, #121212 0%, #1F1F1F 100%)";
const HERO_TEXT_COLOR = "#FFFFFF";
const HERO_TITLE_COLOR = "#FFFFFF";
const HERO_DESCRIPTION_COLOR = "#DDDDDD";
const HERO_BUTTON_BG = "#FF00AA";
const HERO_BUTTON_BG_HOVER = "#E60099";

const HERO_MIN_HEIGHT = "90vh";
const HERO_MAX_WIDTH_TEXT = "700px";
const HERO_MOTION_DURATION = 0.8;

/**
 * Tamaños de tipografía:
 * Evitamos 'h1', 'h3' de MUI para un control más explícito.
 */
const FONT_SIZE_TITLE_LARGE = "7.5rem"; // desktop
const FONT_SIZE_TITLE_MOBILE = "5.5rem";  // mobile
const FONT_SIZE_DESC_LARGE = "1.125rem";
const FONT_SIZE_DESC_MOBILE = "1rem";

/**
 * Componente HeroTalberos:
 * Renderiza la sección principal (Hero) con un título, descripción y botón CTA.
 * Incluye un skip-link accesible, oculto hasta que recibe el foco.
 */
export default function HeroTalberos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Box
      component="section"
      role="region"
      id="hero-section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        minHeight: HERO_MIN_HEIGHT,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: HERO_BG_GRADIENT,
        color: HERO_TEXT_COLOR,
        px: 2,
        userSelect: "none",
      }}
    >
      {/** SKIP LINK: Oculto hasta que recibe foco */}
      <Button
        variant="text"
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          // Cuando se hace focus, se muestra en la esquina sup izquierda
          "&:focus": {
            position: "absolute",
            left: "1rem",
            top: "1rem",
            width: "auto",
            height: "auto",
            p: "0.5rem 1rem",
            backgroundColor: "#000",
            color: "#fff",
            zIndex: 9999,
          },
        }}
      >
        Saltar al contenido principal
      </Button>

      <AnimatePresence>
        {!reduceMotion && (
          <motion.div
            key="hero-motion"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: HERO_MOTION_DURATION }}
          >
            <HeroContent isMobile={isMobile} />
          </motion.div>
        )}
        {reduceMotion && <HeroContent isMobile={isMobile} />}
      </AnimatePresence>
    </Box>
  );
}

/**
 * Subcomponente que muestra título, descripción y botón CTA.
 */
function HeroContent({ isMobile }) {
  return (
    <>
      {/* Título principal - "h1" semántico */}
      <Typography
        id="hero-heading"
        component="h1"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: HERO_TITLE_COLOR,
          fontSize: isMobile ? FONT_SIZE_TITLE_MOBILE : FONT_SIZE_TITLE_LARGE,
        }}
      >
        ¡Talberos es LIBRE!
      </Typography>

      {/* Descripción */}
      <Typography
        component="p"
        sx={{
          mb: 4,
          maxWidth: HERO_MAX_WIDTH_TEXT,
          mx: "auto",
          color: HERO_DESCRIPTION_COLOR,
          lineHeight: 1.6,
          fontSize: isMobile ? FONT_SIZE_DESC_MOBILE : FONT_SIZE_DESC_LARGE,
        }}
      >
        Talberos es una librería de código abierto (MIT) que revoluciona el manejo
        de datos en aplicaciones React. Ofrece tablas interactivas al estilo Excel,
        con filtrado, ordenamiento, edición en tiempo real y exportación a XLSX,
        todo sin costos de licencia.
      </Typography>

      {/* Botón de llamada a la acción */}
      <Button
        variant="contained"
        component="a"
        href="#talberos-section"
        aria-label="Ir a la sección Talberos"
        sx={{
          backgroundColor: HERO_BUTTON_BG,
          color: HERO_TEXT_COLOR,
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          "&:hover": { backgroundColor: HERO_BUTTON_BG_HOVER },
        }}
      >
        Ver Talberos
      </Button>
    </>
  );
}
