"use client";

/**
 * MIT License
 * -----------
 * Archivo: /components/landing/HeroTalberos.js
 *
 * DESCRIPCIÓN:
 *   - Sección principal (Hero) que presenta la librería Talberos de manera destacada.
 *   - Incluye textos y un botón que enlaza con la sección de demostración de tablas.
 *   - Hace uso de animaciones con framer-motion y componentes de Material UI.
 *
 * OBJETIVO:
 *   - Captar la atención del usuario y comunicar los principales beneficios de Talberos.
 *   - Proveer un enlace rápido hacia la sección de tableros (TalberosSection).
 *
 * PRINCIPIOS SOLID:
 *   1. Single Responsibility Principle (SRP):
 *      - Este componente se encarga únicamente de mostrar la sección "Hero":
 *        un encabezado, una descripción y un botón que redirige a la sección de demostración.
 *   2. Open/Closed Principle (OCP):
 *      - Se podría extender el texto o agregar elementos sin modificar la lógica central.
 *   3. Liskov Substitution Principle (LSP):
 *      - No aplica directamente, ya que no hay una jerarquía de herencia.
 *   4. Interface Segregation Principle (ISP):
 *      - El componente no obliga a props extras: su funcionalidad está contenida en sí misma.
 *   5. Dependency Inversion Principle (DIP):
 *      - El componente depende de abstracciones externas (Material UI y framer-motion),
 *        pero no depende de implementaciones específicas del usuario.
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
 * Renderiza la sección principal de la Landing Page,
 * mostrando una breve descripción de la librería Talberos y
 * un botón para redirigir a la sección de tablas.
 *
 * @function HeroTalberos
 * @returns {JSX.Element} JSX que conforma la sección principal de la página.
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
        userSelect: "none"
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
          variant={isMobile ? "h3" : "h1"}
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          ¡Talberos es LIBRE!
        </Typography>

        {/**
         * Descripción del producto, enfatizando la licencia MIT y las
         * funcionalidades principales.
         */}
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{ mb: 4, maxWidth: "700px", mx: "auto", color: "#ddd" }}
        >
          Talberos es una librería Open Source (MIT) que ofrece tablas avanzadas en
          React, con una experiencia similar a Excel. Permite filtrado, ordenamiento,
          edición en vivo y exportación a XLSX, sin costos de licencia.
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
            "&:hover": { backgroundColor: "#E60099" }
          }}
          href="#talberos-section"
        >
          Ver Talberos
        </Button>
      </motion.div>
    </Box>
  );
}
