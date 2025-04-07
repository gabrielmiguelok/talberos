"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/BlogArticleLayout.js
 *
 * DESCRIPCIÓN:
 *   - Layout específico para renderizar un artículo individual en Talberos.
 *   - Presenta título, descripción, fecha, autor, imagen, índice (TOC) y contenido MD/MDX.
 *
 * LICENCIA: MIT
 */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Menu from "@components/landing/Menu";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote";
import {
  BLOG_BG_GRADIENT,
  MAX_CONTENT_WIDTH,
} from "@constants/blog/blogStyles";

export default function BlogArticleLayout({
  title,
  description,
  date,
  author,
  image,
  pageUrl,
  jsonLdData,
  keywords,
  isMdx,
  mdxSource,
  htmlContent,
  TableOfContents,
  headings,
  fallbackImages,
  children,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark-mode"));
    }
  }, []);

  const { fallbackImageWebp, fallbackImagePng, fallbackImageJpg } = fallbackImages;
  const hasCustomImage = Boolean(image);
  const finalKeywords = keywords && keywords.length > 0 ? keywords.join(", ") : "";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content={author} />

        {finalKeywords && <meta name="keywords" content={finalKeywords} />}

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        {hasCustomImage ? (
          <meta property="og:image" content={image} />
        ) : (
          <>
            <meta property="og:image" content={fallbackImageWebp} />
            <meta property="og:image" content={fallbackImagePng} />
            <meta property="og:image" content={fallbackImageJpg} />
          </>
        )}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {hasCustomImage ? (
          <meta name="twitter:image" content={image} />
        ) : (
          <>
            <meta name="twitter:image" content={fallbackImageWebp} />
            <meta name="twitter:image" content={fallbackImagePng} />
            <meta name="twitter:image" content={fallbackImageJpg} />
          </>
        )}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />

        {/* Theme color */}
        <meta name="theme-color" content="#0d47a1" />
      </Head>

      {/* MENÚ PRINCIPAL */}
      <Menu />

      {/* CONTENEDOR PRINCIPAL */}
      <Box
        component="article"
        role="article"
        aria-label={`Artículo: ${title}`}
        sx={{
          background: BLOG_BG_GRADIENT,
          minHeight: "100vh",
          pt: isMobile ? 10 : 10,
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            margin: "0 auto",
            pb: 4,
            px: isMobile ? 2 : 3,
            background: "transparent",
          }}
        >
          {children /* contenido adicional opcional */}

          {/* CABECERA */}
          <header style={{ textAlign: "center", marginBottom: "2rem", marginTop: "2rem" }}>
            <Typography
              component="h1"
              sx={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                mb: 1,
                color: "#0d47a1",
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                component="h2"
                sx={{ fontSize: "1.2rem", color: "#555555", mb: 2 }}
              >
                {description}
              </Typography>
            )}

            {date && (
              <Typography
                component="p"
                sx={{ color: "#666666", fontStyle: "italic" }}
              >
                {new Date(date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            )}
          </header>

          {/* IMAGEN PRINCIPAL */}
          {hasCustomImage ? (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Image
                src={image}
                alt={`Imagen principal del artículo: ${title}`}
                width={1200}
                height={600}
                priority
                style={{
                  borderRadius: 8,
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Image
                src={fallbackImagePng}
                alt="Imagen de fallback para artículos"
                width={1200}
                height={600}
                priority
                style={{
                  borderRadius: 8,
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Box>
          )}

          {/* ÍNDICE AUTOMÁTICO */}
          {TableOfContents && headings.length > 0 && (
            <Box sx={{ my: 4 }}>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid #DDD",
                  margin: "1.5rem 0",
                }}
              />
              <TableOfContents headings={headings} />
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid #DDD",
                  margin: "1.5rem 0",
                }}
              />
            </Box>
          )}

          {/* CONTENIDO DEL ARTÍCULO */}
          <Box
            component="section"
            sx={{
              color: "#1F1F1F",
              lineHeight: 1.7,
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                marginTop: "2rem",
                marginBottom: "1rem",
              },
              "& p": { marginBottom: "1rem" },
              "& code": {
                backgroundColor: "#FFFFFF",
                color: "#000000",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.95rem",
                fontFamily:
                  "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
              },
              "& pre": {
                backgroundColor: "#FFFFFF",
                padding: "1rem",
                borderRadius: "8px",
                overflowX: "auto",
                marginBottom: "1.5rem",
                marginTop: "1rem",
                color: "#000000",
              },
              "& blockquote": {
                borderLeft: `4px solid #0d47a1`,
                backgroundColor: "#FFFFFF",
                padding: "1rem 1.5rem",
                margin: "1.5rem 0",
                fontStyle: "italic",
                color: "#555555",
              },
            }}
          >
            {isMdx ? (
              <MDXRemote {...mdxSource} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </Box>

          {/* FOOTER */}
          <footer style={{ marginTop: "2rem", textAlign: "center" }}>
            <Typography component="p" sx={{ color: "#666666" }}>
              © {new Date().getFullYear()} Talberos - Proyecto Open Source (MIT).
            </Typography>
          </footer>
        </Box>
      </Box>
    </>
  );
}
