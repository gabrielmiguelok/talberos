"use client";

/**
 * MIT License
 * -----------
 * Archivo: /components/landing/HeroTalberos.js
 *
 * DESCRIPCIÓN:
 *   - Sección principal (Hero) que presenta de forma destacada la librería Talberos.
 *   - Utiliza animaciones (framer-motion) y Material UI para ofrecer una experiencia visual atractiva.
 *   - Muestra un título impactante, una descripción coherente sobre sus beneficios y un botón de llamada a la acción.
 *
 * OBJETIVO:
 *   - Captar la atención del usuario con un mensaje claro y atractivo.
 *   - Comunicar los beneficios de Talberos: una solución de código abierto (MIT) para crear tablas interactivas en React.
 *   - Redirigir al usuario hacia la sección de demostración de tablas.
 *
 * PRINCIPIOS SOLID:
 *   1. Single Responsibility Principle (SRP):
 *      - Se encarga únicamente de renderizar la sección "Hero".
 *   2. Open/Closed Principle (OCP):
 *      - Es fácil de extender sin modificar su lógica central.
 *   3. Liskov Substitution Principle (LSP):
 *      - Puede ser reemplazado por otro componente que cumpla la misma interfaz.
 *   4. Interface Segregation Principle (ISP):
 *      - Su funcionalidad es autónoma sin necesidad de props adicionales.
 *   5. Dependency Inversion Principle (DIP):
 *      - Depende de abstracciones externas (Material UI y framer-motion) sin acoplarse a implementaciones concretas.
 *
 * LICENCIA:
 *   - Este código se ofrece con fines educativos bajo licencia MIT.
 */

import React from "react";
import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * Componente HeroTalberos:
 * Renderiza la sección principal de la Landing Page mostrando un título,
 * una descripción coherente que destaca los beneficios de Talberos y un botón
 * para redirigir a la sección de tablas.
 *
 * @component HeroTalberos
 * @returns {JSX.Element} Componente que renderiza la sección principal de la página.
 *
 * @example
 * // Ejemplo de uso:
 * <HeroTalberos />
 */
export default function HeroTalberos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="section"
      id="hero-section"
      aria-labelledby="hero-title"
      sx={{
        height: "90vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #121212 0%, #1F1F1F 100%)",
        color: "#FFFFFF",
        px: 2,
        userSelect: "none",
      }}
    >
      {/* Contenedor animado */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/**
         * Título principal que se adapta a pantallas pequeñas (h3) o grandes (h1).
         */}
        <Typography
          id="hero-title"
          variant={isMobile ? "h3" : "h1"}
          component="h1"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          ¡Talberos es LIBRE!
        </Typography>

        {/**
         * Descripción actualizada:
         * Se destaca la naturaleza de código abierto (MIT) de Talberos, y se subraya su capacidad
         * para crear tablas interactivas en React con una experiencia similar a Excel, sin costos de licencia.
         */}
        <Typography
          component="p"
          variant={isMobile ? "body1" : "h6"}
          sx={{ mb: 4, maxWidth: "700px", mx: "auto", color: "#ddd" }}
        >
          Talberos es una librería de código abierto (MIT) que revoluciona el manejo de datos en aplicaciones React. Ofrece tablas interactivas con una experiencia similar a Excel, permitiendo filtrado, ordenamiento, edición en tiempo real y exportación a XLSX, todo sin costos de licencia.
        </Typography>

        {/**
         * Botón que redirige a la sección de tableros (TalberosSection),
         * anclado mediante id (#talberos-section).
         */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#FF00AA",
            color: "#FFFFFF",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#E60099" },
          }}
          href="#talberos-section"
        >
          Ver Talberos
        </Button>
      </motion.div>
    </Box>
  );
}
