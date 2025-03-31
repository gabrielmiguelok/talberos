"use client";

/**
 * FooterRefactorSOLID.jsx
 * -----------------------------------------------------------------------------
 * LICENCIA: MIT
 *
 * OBJETIVO:
 *   - Ofrecer un footer responsivo y accesible, centrado en mobile y
 *     bien distribuido en desktop, para un proyecto con fines educativos.
 *   - Aplicar principios SOLID y mantener una excelente autodocumentación.
 *
 * ESTRUCTURA DE SUBCOMPONENTES:
 *   1) NoPaymentSection:    Indica que no existen planes de pago (100% gratis).
 *   2) FooterLegalLinks:    Enlaces legales o informativos.
 *   3) FooterContact:       Datos de contacto de Talberos (email, teléfono).
 *   4) FooterBrand:         Logo, nombre y redes sociales de Talberos.
 *   5) FooterRefactorSOLID: Componente principal que orquesta el layout.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Cada subcomponente cumple una sola responsabilidad (mostrar datos de contacto, enlaces legales, etc.).
 *   - OCP: Se pueden añadir enlaces, secciones o estilos adicionales sin alterar el núcleo del footer.
 *   - LSP e ISP: No hay herencias complejas ni dependencias forzadas; cada parte se explica por sí misma.
 *   - DIP: El footer no asume cómo o dónde se obtienen los datos (solo recibe props); sus dependencias (e.g. redes sociales) están aisladas.
 *
 * AUTOR: Talberos (Proyecto Educativo)
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

// Ejemplo de redes sociales, importado de un utils
import { socialNetworksOptions } from "@utils/socialNetworksOptions";

/* -----------------------------------------------------------------------------
   1) SUBCOMPONENTE: NoPaymentSection
   ------------------------------------------------------------------------------
   - Responsabilidad: Mostrar que “Talberos” es 100% gratis y enfatizar que
     no existen planes de pago.
   - Estructura: Título + Ícono X + texto (todo alineado o centrado).
   - Uso: Incrustado en el Footer para reforzar la idea de gratuidad.
------------------------------------------------------------------------------ */
function NoPaymentSection({ sectionTitle }) {
  return (
    <Box
      component="section"
      aria-labelledby="no-payment-title"
      textAlign="center"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Typography
        id="no-payment-title"
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
            {/* Ícono que refuerza la idea de 'sin planes de pago' */}
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
   - Uso: Explicitar rutas a documentos legales o secciones útiles al usuario.
------------------------------------------------------------------------------ */
function FooterLegalLinks({ sectionTitle, linksData }) {
  return (
    <Box
      component="section"
      aria-labelledby="legal-links-title"
      textAlign="center"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Typography
        id="legal-links-title"
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: "bold", mb: 1, color: "#FF00AA" }}
      >
        {sectionTitle}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          paddingLeft: 0,
          margin: 0,
          display: "inline-block",
          textAlign: "left",
        }}
      >
        {linksData.map(({ href, label }) => (
          <li key={label}>
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
    <Box
      component="section"
      aria-labelledby="footer-contact-title"
      textAlign="center"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Typography
        id="footer-contact-title"
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
   - Responsabilidad: Mostrar el logo, nombre de la marca, redes sociales y un
     subtítulo.
   - Estructura:
       * Logo + Nombre
       * Subtítulo
       * Íconos de redes sociales (map sobre socialNetworksOptions)
------------------------------------------------------------------------------ */
function FooterBrand({ brandName, brandSubtitle }) {
  return (
    <Box
      component="section"
      aria-labelledby="footer-brand-title"
      textAlign="center"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      {/* Logo y nombre */}
      <Box
        id="footer-brand-title"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={1}
      >
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

      {/* Íconos de redes sociales */}
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
   - Responsabilidad: Orquestar todos los subcomponentes en un layout responsivo,
     accesible, y con una cuidada disposición visual:
       * Versión Mobile (apilado y centrado)
       * Versión Desktop (columnas mediante Grid)
   - Se hace uso de MUI + Framer Motion para animaciones y estilos.
   - Licencia: MIT
------------------------------------------------------------------------------ */
export default function FooterRefactorSOLID() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Enlaces de ejemplo para la sección “Más Info”
  const legalLinks = [
    { href: "/aviso-legal", label: "Aviso Legal" },
    { href: "/politica-privacidad", label: "Política de Privacidad" },
  ];

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        mt: 6,
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
        {/* -------------------------------------------
            [A] Versión Mobile: apilado, todo centrado
         ------------------------------------------- */}
        {isMobile ? (
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
          /* -------------------------------------------
              [B] Versión Desktop: Grid en columnas
           ------------------------------------------- */
          <Grid container spacing={6}>
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
            mt: 6,
            mb: 2,
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        />

        {/* COPYRIGHT FINAL */}
        <Typography
          variant="body2"
          sx={{ textAlign: "center", color: "#fff", lineHeight: 1.6 }}
        >
          © 2025 Talberos. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
