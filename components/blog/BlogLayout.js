/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/BlogLayout.js
 *
 * DESCRIPCIÓN:
 *  - Layout principal para la página de índice del blog.
 *  - Responsable de renderizar la parte de SEO (Head), el menú y el contenedor
 *    donde se colocará la lista de posts.
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Solo define la estructura general de la página principal del blog.
 *  - SoC (Separation of Concerns): Delega la lista de posts a un componente externo (BlogList).
 *
 * LICENCIA: MIT
 */

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Menu from "@components/landing/Menu";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Importamos constantes de estilos
import {
  BLOG_BG_GRADIENT,
  BLOG_TEXT_COLOR,
  BLOG_TITLE_COLOR,
  BLOG_MAIN_HEADING_FONT_SIZE_MOBILE,
  BLOG_MAIN_HEADING_FONT_SIZE_DESKTOP,
  BLOG_MAIN_HEADING_FONT_WEIGHT,
  BLOG_SUBTITLE_FONT_SIZE,
  BLOG_SUBTITLE_COLOR,
  BLOG_SUBTITLE_MARGIN_BOTTOM,
  BLOG_INTRO_TEXT_COLOR,
  BLOG_INTRO_TEXT_SIZE,
  BLOG_INTRO_MAX_WIDTH,
  BLOG_INTRO_LINE_HEIGHT,
  MAX_CONTENT_WIDTH,
  BLOG_TITLE,
  BLOG_DESCRIPTION,
  BLOG_BASE_URL,
  BLOG_KEYWORDS,
  BLOG_IMAGE_WEBP,
  BLOG_IMAGE_PNG,
  BLOG_IMAGE_JPG,
} from "@constants/blog/blogStyles";

export default function BlogLayout({ children, posts = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark-mode"));
    }
  }, []);

  // URL y JSON-LD
  const pageUrl = `${BLOG_BASE_URL}/blog`;
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
  };

  return (
    <>
      <Head>
        <title>{BLOG_TITLE}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
        <meta name="keywords" content={BLOG_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content="Talberos Ecosystem" />

        {/* Open Graph (OG) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={BLOG_TITLE} />
        <meta property="og:description" content={BLOG_DESCRIPTION} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={BLOG_IMAGE_WEBP} />
        <meta property="og:image" content={BLOG_IMAGE_PNG} />
        <meta property="og:image" content={BLOG_IMAGE_JPG} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BLOG_TITLE} />
        <meta name="twitter:description" content={BLOG_DESCRIPTION} />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:image" content={BLOG_IMAGE_WEBP} />
        <meta name="twitter:image" content={BLOG_IMAGE_PNG} />
        <meta name="twitter:image" content={BLOG_IMAGE_JPG} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* theme-color para móviles */}
        <meta name="theme-color" content="#0d47a1" />
      </Head>

      {/* MENÚ PRINCIPAL */}
      <Menu />

      {/* CONTENIDO PRINCIPAL */}
      <main>
        <Box
          sx={{
            background: BLOG_BG_GRADIENT,
            position: "relative",
            minHeight: "100vh",
            pt: isMobile ? 10 : 12,
            pb: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: MAX_CONTENT_WIDTH,
              margin: "0 auto",
              background: "transparent",
              px: isMobile ? 2 : 3,
              color: BLOG_TEXT_COLOR,
            }}
          >
            {/* ENCABEZADO DEL BLOG */}
            <Box sx={{ textAlign: "center", mb: 5, mt: 2 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: isMobile
                    ? BLOG_MAIN_HEADING_FONT_SIZE_MOBILE
                    : BLOG_MAIN_HEADING_FONT_SIZE_DESKTOP,
                  fontWeight: BLOG_MAIN_HEADING_FONT_WEIGHT,
                  mb: 2,
                  color: BLOG_TITLE_COLOR,
                }}
              >
                {BLOG_TITLE}
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontSize: BLOG_SUBTITLE_FONT_SIZE,
                  color: BLOG_SUBTITLE_COLOR,
                  mb: BLOG_SUBTITLE_MARGIN_BOTTOM,
                }}
              >
                {BLOG_DESCRIPTION}
              </Typography>

              <Typography
                component="p"
                sx={{
                  fontSize: BLOG_INTRO_TEXT_SIZE,
                  maxWidth: BLOG_INTRO_MAX_WIDTH,
                  margin: "0 auto",
                  color: BLOG_INTRO_TEXT_COLOR,
                  lineHeight: BLOG_INTRO_LINE_HEIGHT,
                }}
              >
                {/* Texto introductorio adicional si se desea */}
              </Typography>
            </Box>

            {/* AQUI INYECTAMOS children: Lista de posts */}
            {children}

            {/* Pie de página */}
            <Box sx={{ textAlign: "center", mt: 6 }}>
              <Typography
                component="p"
                sx={{ fontSize: "0.85rem", color: BLOG_TEXT_COLOR }}
              >
                © {new Date().getFullYear()} Talberos. Proyecto Open Source - MIT.
              </Typography>
            </Box>
          </Box>
        </Box>
      </main>
    </>
  );
}
