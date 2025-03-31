"use client";

/**
 * FooterRefactorSOLID.jsx
 * -----------------------------------------------------------------------------
 * LICENCIA: MIT
 *
 * OBJETIVO:
 *   - Un footer responsivo y centrado en mobile, organizado y accesible,
 *     aplicado a un proyecto MIT con propósitos educativos y enfoque SOLID.
 *   - Todos los subcomponentes tienen una sola responsabilidad.
 *   - Contiene auto-documentación clara para enseñar las buenas prácticas.
 *
 * ESTRUCTURA:
 *   1) NoPaymentSection:    Indica que no existen planes de pago (100% gratis).
 *   2) FooterLegalLinks:    Enlaces legales o informativos.
 *   3) FooterContact:       Datos de contacto de Talberos (email, teléfono).
 *   4) FooterBrand:         Logo, nombre y redes sociales de Talberos.
 *   5) FooterRefactorSOLID: Componente principal que orquesta el layout.
 *
 * DETALLES DE DISEÑO:
 *   - Modo mobile: Contenido centrado (text-align: center), con secciones
 *     apiladas verticalmente y márgenes consistentes.
 *   - Modo escritorio: Distribución en columnas por Grid, con estilos
 *     limpios y espacios adecuados, manteniendo accesibilidad.
 */

import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa";
import { socialNetworksOptions } from "@utils/socialNetworksOptions";

/* -----------------------------------------------------------------------------
   1) SUBCOMPONENTE: NoPaymentSection
   ------------------------------------------------------------------------------
   - Responsabilidad: Mostrar que “Talberos” es 100% gratis, sin planes de pago.
   - Estructura: Ícono X + texto breve, centrable.
   - Uso: Se integra en el footer para enfatizar que no hay costos.
------------------------------------------------------------------------------ */
function NoPaymentSection({ sectionTitle }) {
  return (
    <Box textAlign="center">
      <Typography
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: "bold", mb: 1, color: "#FF00AA" }}
      >
        {sectionTitle}
      </Typography>

      {/* Contenedor para el ícono y texto */}
      <Box
        display="inline-flex"
        alignItems="center"
        gap={1}
        sx={{ color: "#fff", fontSize: "0.9rem", lineHeight: 1.6 }}
      >
        <motion.div whileHover={{ scale: 1.1 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#2B2B2B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s",
              "&:hover": { backgroundColor: "#FF00AA" },
            }}
            aria-hidden="true"
          >
            {/* Ícono que refuerza la idea de 'sin pagos' */}
            <FaTimesCircle size={24} style={{ color: "#fff" }} />
          </Box>
        </motion.div>

        {/* Texto: 100% gratis */}
        <Typography component="span" sx={{ color: "#fff", ml: 1 }}>
          No existen planes de pago
          <br />
          <strong>¡Talberos es gratuito!</strong>
        </Typography>
      </Box>
    </Box>
  );
}

/* -----------------------------------------------------------------------------
   2) SUBCOMPONENTE: FooterLegalLinks
   ------------------------------------------------------------------------------
   - Responsabilidad: Lista de enlaces legales / informativos (ej.: Aviso Legal).
   - Estructura: Título + <ul> con <li> enlazados.
   - Uso: Explicitar rutas a documentos legales o secciones.
------------------------------------------------------------------------------ */
function FooterLegalLinks({ sectionTitle, linksData }) {
  return (
    <Box textAlign="center">
      <Typography
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: "bold", mb: 1, color: "#FF00AA" }}
      >
        {sectionTitle}
      </Typography>
      <Box
        component="ul"
        sx={{ listStyle: "none", paddingLeft: 0, margin: 0, display: "inline-block" }}
      >
        {linksData.map(({ href, label }) => (
          <li key={label} style={{ textAlign: "left" }}>
            <Link
              href={href}
              underline="none"
              sx={{
                color: "#fff",
                display: "inline-block",
                mb: 1,
                "&:hover": { color: "#FF00AA" },
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </Box>
    </Box>
  );
}

/* -----------------------------------------------------------------------------
   3) SUBCOMPONENTE: FooterContact
   ------------------------------------------------------------------------------
   - Responsabilidad: Presentar la información de contacto (email + teléfono).
   - Estructura: Título + texto en bloque.
   - Uso: Mostrar al usuario cómo comunicarse con Talberos.
------------------------------------------------------------------------------ */
function FooterContact({ sectionTitle, contactEmail, contactPhone }) {
  return (
    <Box textAlign="center">
      <Typography
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: "bold", mb: 1, color: "#FF00AA" }}
      >
        {sectionTitle}
      </Typography>
      <Typography variant="body2" sx={{ color: "#fff", lineHeight: 1.6 }}>
        {contactEmail}
        <br />
        {contactPhone}
      </Typography>
    </Box>
  );
}

/* -----------------------------------------------------------------------------
   4) SUBCOMPONENTE: FooterBrand
   ------------------------------------------------------------------------------
   - Responsabilidad: Muestra el logo + nombre de marca + redes sociales + un
     subtítulo descriptivo.
   - Estructura:
       * Logo + Nombre (en la misma fila)
       * Subtítulo
       * Íconos de redes sociales
------------------------------------------------------------------------------ */
function FooterBrand({ brandName, brandSubtitle }) {
  return (
    <Box textAlign="center">
      {/* Logo y nombre */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
        <img
          src="/logo.png"
          alt="Talberos brand logo"
          style={{ width: 50, height: "auto", marginRight: 10 }}
        />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
          {brandName}
        </Typography>
      </Box>

      {/* Subtítulo breve */}
      <Typography
        variant="body2"
        sx={{ color: "#ccc", mb: 2, lineHeight: 1.4, textAlign: "center" }}
      >
        {brandSubtitle}
      </Typography>

      {/* Íconos de redes sociales, usando socialNetworksOptions */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="center"
        sx={{ mb: 2 }}
      >
        {socialNetworksOptions.map(({ label, icon, color, link }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.1 }}
            style={{ fontSize: 24 }}
          >
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color,
                "&:hover": { opacity: 0.8 },
                transition: "opacity 0.2s ease-in-out",
              }}
              aria-label={label}
            >
              {icon}
            </Link>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

/* -----------------------------------------------------------------------------
   5) COMPONENTE PRINCIPAL: FooterRefactorSOLID
   ------------------------------------------------------------------------------
   - Responsabilidad: Orquestar todos los subcomponentes en un layout responsivo
     y accesible, centrado en mobile.
   - Modo Mobile: Apilado en columna, todo centrado.
   - Modo Desktop: Grid en columnas, con cada bloque en su propia columna.
   - Usa contenedores con paddings y separador final. Licencia MIT.
------------------------------------------------------------------------------ */
export default function FooterRefactorSOLID() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Ejemplo de enlaces legales
  const legalLinks = [
    { href: "/aviso-legal", label: "Aviso Legal" },
    { href: "/politica-privacidad", label: "Política de Privacidad" },
  ];

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        mt: 4,
        backgroundColor: "#121212",
        userSelect: "none",
      }}
    >
      <Container
        component={motion.div}
        maxWidth="lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        sx={{ pt: 6, pb: 4 }}
      >
        {isMobile ? (
          /* -----------------------------------------------------------
             [A] VERSIÓN MOBILE: TODO CENTRADO
          ----------------------------------------------------------- */
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            sx={{ textAlign: "center" }}
          >
            <FooterBrand
              brandName="Talberos"
              brandSubtitle="Tablas estilo Excel en React, totalmente gratis (MIT)."
            />
            <NoPaymentSection sectionTitle="Formas de Pago" />
            <FooterLegalLinks sectionTitle="Más Info" linksData={legalLinks} />
            <FooterContact
              sectionTitle="Contacto"
              contactEmail="info@talberos.tech"
              contactPhone="+54 9 (236) 465-5702"
            />
          </Box>
        ) : (
          /* -----------------------------------------------------------
             [B] VERSIÓN ESCRITORIO: DISTRIBUCIÓN EN COLUMNAS
          ----------------------------------------------------------- */
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <FooterBrand
                brandName="Talberos"
                brandSubtitle="Tablas estilo Excel en React, totalmente gratis (MIT)."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <NoPaymentSection sectionTitle="Formas de Pago" />
            </Grid>
            <Grid item xs={12} md={3}>
              <FooterLegalLinks sectionTitle="Más Info" linksData={legalLinks} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FooterContact
                sectionTitle="Contacto"
                contactEmail="info@talberos.tech"
                contactPhone="+54 9 (236) 465-5702"
              />
            </Grid>
          </Grid>
        )}

        {/* SEPARADOR VISUAL */}
        <Box
          sx={{
            mt: 4,
            mb: 2,
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        />

        {/* COPYRIGHT FINAL */}
        <Typography variant="body2" sx={{ textAlign: "center", color: "#fff" }}>
          © 2025 Talberos. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
