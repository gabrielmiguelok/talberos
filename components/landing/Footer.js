"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/landing/Footer.js
 *
 * DESCRIPCIÓN:
 *   - Footer reorganizado para permitir:
 *       1. Ajustar posición relativa y absoluta de cada fila/elemento fácilmente.
 *       2. Mantener “Talberos LIBRE!” a la misma altura (mismo estilo) que el texto central.
 *       3. Ubicar íconos de redes sociales debajo de los enlaces, en el centro.
 *       4. Dejar vacía la zona donde antes estaban los íconos en la primera fila (der).
 *
 * PRINCIPIOS SOLID + CLEAN CODE + PRÁCTICAS:
 *   - KISS / DRY / YAGNI: Simplificar y evitar duplicaciones innecesarias.
 *   - SoC / SRP: Footer se encarga solo de su responsabilidad.
 *   - OCP: Fácil de extender (añadir/quitar enlaces, texto, posiciones).
 *   - DIP: Configuraciones externas y fáciles de inyectar.
 *   - Clean Code: Variables descriptivas y claras, todo bien estructurado.
 *   - Arquitectura Escalable: Dividimos la lógica y la configuración.
 *   - Manejo de Estilos: Constants + sx para mayor flexibilidad.
 *
 * LICENCIA:
 *   - Código bajo licencia MIT.
 */

import React from "react";
import Image from "next/image";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

/* -------------------------------------------------------------------------
   0) CONFIGURACIÓN DE POSICIONES (RELATIVAS / ABSOLUTAS) POR FILA
   ------------------------------------------------------------------------- */

/**
 * Cada objeto controla la posición de su respectiva “fila” o sección.
 * Se pueden usar propiedades como:
 *   - position: "relative" | "absolute"
 *   - top, left, right, bottom: "npx"
 *   - transform: "translateX(...) translateY(...)"
 *   - etc.
 *
 * Ajustar a conveniencia para reubicar cada parte sin tocar el resto del código.
 */
const POSICION_FILA_1 = {
  position: "relative",
  top: 5,
  left: -55
  // left: 0,
  // transform: "translate(0, 0)",
};

const POSICION_FILA_2 = {
  position: "relative",
  top: -5,
};

const POSICION_FILA_3 = {
  position: "relative",
  top: 0,
};

const POSICION_FILA_4 = {
  position: "relative",
  top: 0,
};

const POSICION_FILA_5 = {
  position: "relative",
  top: 0,
};

/* -------------------------------------------------------------------------
   1) CONSTANTES DE PALETA Y ESTILOS BÁSICOS
   ------------------------------------------------------------------------- */
const FOOTER_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
const FOOTER_TEXT_COLOR = "#1F1F1F";
const FOOTER_HEADING_COLOR = "#0d47a1";
const FOOTER_LINK_COLOR = "#0d47a1";

const FOOTER_PADDING_Y = { xs: 3, md: 4 };
const FOOTER_PADDING_X = { xs: 2, md: 6 };
const FOOTER_CONTAINER_MAX_WIDTH = "lg";

/* -------------------------------------------------------------------------
   2) TIPOGRAFÍA Y TAMAÑOS
   ------------------------------------------------------------------------- */

/**
 * Se unifica el estilo de "Talberos LIBRE!" con el texto central,
 * cumpliendo el requisito de "misma altura" (mismo fontSize, bold, etc.).
 */
const SHARED_BIG_TEXT_SIZE = "2.5rem"; // Tamaño grande y llamativo
const SHARED_BIG_TEXT_WEIGHT = "bold";
const SHARED_BIG_TEXT_LOGO = "1.5rem";
const MIDDLE_TEXT_COLOR = "#0d47a1";
const MIDDLE_TEXT_MAX_WIDTH = "800px"; // Límite para texto de 2+ líneas

const FOOTER_LINK_FONT_SIZE = "0.95rem";
const FOOTER_LINK_LINE_HEIGHT = 1.5;

const COPYRIGHT_FONT_SIZE = "0.8rem";
const COPYRIGHT_OPACITY = 0.7;

const LOGO_SIZE = 48; // Tamaño del logo

/* -------------------------------------------------------------------------
   3) ANIMACIONES FRAMER MOTION
   ------------------------------------------------------------------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------
   4) DATOS: ENLACES Y REDES
   ------------------------------------------------------------------------- */
const NAV_LINKS = [
  { label: "Blog", url: "https://talberos.com/blog" },
  { label: "GitHub", url: "https://github.com/gabrielmiguelok/talberos" },
  { label: "LinkedIn", url: "https://linkedin.com/company/talberos" },
];

const SOCIAL_LINKS = [
  {
    label: "Talberos en LinkedIn",
    icon: <FaLinkedin size={20} />,
    url: "https://linkedin.com/company/talberos",
  },
  {
    label: "Talberos en GitHub",
    icon: <FaGithub size={20} />,
    url: "https://github.com/gabrielmiguelok/talberos",
  },
  {
    label: "Talberos en Instagram",
    icon: <FaInstagram size={20} />,
    url: "https://www.instagram.com/talberos",
  },
];

/* -------------------------------------------------------------------------
   5) COMPONENTE PRINCIPAL: Footer
   ------------------------------------------------------------------------- */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        background: FOOTER_BG_GRADIENT,
        color: FOOTER_TEXT_COLOR,
        py: FOOTER_PADDING_Y,
        px: FOOTER_PADDING_X,
        overflow: "hidden",
      }}
    >
      <Container maxWidth={FOOTER_CONTAINER_MAX_WIDTH}>
        {/* ------------------------------------------------------------------
            Fila 1: Logo + “Talberos LIBRE!” (mismo estilo que texto central),
            Parte derecha vacía donde antes estaban los íconos.
        ------------------------------------------------------------------ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={POSICION_FILA_1}
          >
            {/* Columna Izquierda: Logo + Marca */}
            <Grid item xs={12} md="auto">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 2 }}>
                  <Image
                    src="/images/logo.png"
                    alt="Talberos Logo"
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Box>
                <Box>
                  <Typography
                    component="p"
                    sx={{
                      fontSize: SHARED_BIG_TEXT_LOGO,
                      fontWeight: SHARED_BIG_TEXT_WEIGHT,
                      color: FOOTER_HEADING_COLOR,
                      m: 0,
                      userSelect: "none",
                    }}
                  >
                    Talberos LIBRE!
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha: ahora vacía (antes redes) */}
            <Grid item xs={12} md="auto">
              {/* Vacío intencionalmente */}
              <Box />
            </Grid>
          </Grid>
        </motion.div>

        {/* ------------------------------------------------------------------
            Fila 2: Texto central (por qué…)
        ------------------------------------------------------------------ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              display: "flex",
              justifyContent: "center",
              ...POSICION_FILA_2,
            }}
          >
            <Typography
              component="p"
              sx={{
                textAlign: "center",
                fontSize: SHARED_BIG_TEXT_SIZE,
                fontWeight: SHARED_BIG_TEXT_WEIGHT,
                color: MIDDLE_TEXT_COLOR,
                lineHeight: 1.2,
                maxWidth: MIDDLE_TEXT_MAX_WIDTH,
                userSelect: "none",
              }}
            >
              Porque es mejor dejar atrás el pasado y construir un nuevo futuro
            </Typography>
          </Box>
        </motion.div>

        {/* ------------------------------------------------------------------
            Fila 3: Enlaces (Blog, GitHub, LinkedIn)
        ------------------------------------------------------------------ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box
            sx={{
              mt: { xs: 2, md: 3 },
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              ...POSICION_FILA_3,
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: FOOTER_LINK_FONT_SIZE,
                  lineHeight: FOOTER_LINK_LINE_HEIGHT,
                  color: FOOTER_LINK_COLOR,
                  userSelect: "none",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
        </motion.div>

        {/* ------------------------------------------------------------------
            Fila 4: Íconos de Redes Sociales (abajo de los enlaces, centrado)
        ------------------------------------------------------------------ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box
            sx={{
              mt: { xs: 2, md: 3 },
              display: "flex",
              justifyContent: "center",
              userSelect: "none",
              ...POSICION_FILA_4,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              {SOCIAL_LINKS.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: FOOTER_LINK_COLOR,
                    userSelect: "none",
                    "&:hover": { opacity: 0.8 },
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* ------------------------------------------------------------------
            Fila 5: Copyright
        ------------------------------------------------------------------ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ textAlign: "center", mt: { xs: 3, md: 4 }, ...POSICION_FILA_5 }}>
            <Typography
              component="p"
              sx={{
                fontSize: COPYRIGHT_FONT_SIZE,
                color: FOOTER_TEXT_COLOR,
                opacity: COPYRIGHT_OPACITY,
                userSelect: "none",
                mb: 0.5,
              }}
            >
              © {new Date().getFullYear()} Talberos LIBRE!
            </Typography>
            <Typography
              component="p"
              sx={{
                fontSize: COPYRIGHT_FONT_SIZE,
                color: FOOTER_TEXT_COLOR,
                opacity: COPYRIGHT_OPACITY,
                userSelect: "none",
              }}
            >
              Código bajo licencia MIT
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
