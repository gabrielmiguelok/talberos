"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/ContentBoxLayout.js
 *
 * DESCRIPCIÓN:
 *   - Contenedor reutilizable para encapsular contenido con fondo y padding configurables.
 *   - Permite aislar secciones del layout principal y dar estilo propio.
 *
 * LICENCIA: MIT
 */
import React from "react";
import { Box } from "@mui/material";

export default function ContentBoxLayout({
  children,
  background = "#FFFFFF",
  padding = 4,
  marginY = 4,
  borderRadius = 2,
  ...props
}) {
  return (
    <Box
      sx={{
        background,
        borderRadius,
        p: padding,
        my: marginY,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
