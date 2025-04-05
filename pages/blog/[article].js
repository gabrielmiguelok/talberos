"use client";
/************************************************************************************************
 * FILE: ./pages/blog/[article].js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   - Página dinámica para renderizar artículos .md o .mdx desde /blogs en Talberos.
 *   - Aplica la misma paleta y estilo que HeroTalberos y UniqueDifferentiator, con un gradiente
 *     de fondo y colores de texto en HEX (#rrggbb).
 *   - Integra SEO avanzado, fallbacks de imagen, y genera rutas estáticas (SSG).
 ************************************************************************************************/

import React, { useState, useEffect } from "react";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import Image from "next/image";

/** ---------------------------------------------------------------------------------------------
 * IMPORT DINÁMICO: Cargamos el Menu sin SSR para poder usar hooks de cliente (useState, etc.)
 * -------------------------------------------------------------------------------------------*/
const Menu = dynamic(() => import("../../components/landing/Menu"), {
  ssr: false,
});

/** ---------------------------------------------------------------------------------------------
 * CONSTANTES DE CONFIGURACIÓN (Misma paleta / estilo del Hero y otros componentes)
 * -------------------------------------------------------------------------------------------*/

/** Fondos y colores principales */
const ARTICLE_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
const ARTICLE_TEXT_COLOR = "#1F1F1F";
const ARTICLE_TITLE_COLOR = "#0d47a1";
const ARTICLE_SUBTITLE_COLOR = "#555555";
const ARTICLE_FALLBACK_TEXT_COLOR = "#666666"; // Para pies de página o fecha
const ARTICLE_CODE_BG_COLOR = "#FFFFFF";
const ARTICLE_BLOCKQUOTE_COLOR = "#cccccc";

/** Contenedor y layout */
const ARTICLE_CONTAINER_MAX_WIDTH = 1200;
const ARTICLE_CONTAINER_PADDING_TOP = 10; // se usa para spacing top
const ARTICLE_CONTAINER_PADDING_SIDE = 3; // se usa para spacing lateral
const ARTICLE_CONTAINER_BOX_SHADOW = 3;   // leve sombra
const ARTICLE_CONTAINER_BORDER_RADIUS = 0;
const ARTICLE_HEADER_MARGIN_BOTTOM = "2rem";
const ARTICLE_HEADER_MARGIN_TOP = "2rem";

/** Tipografía general */
const ARTICLE_TITLE_FONT_SIZE = "2.5rem"; // Títulos de artículos
const ARTICLE_TITLE_FONT_WEIGHT = "bold";
const ARTICLE_SUBTITLE_FONT_SIZE = "1.2rem";

/** Blockquote y código */
const ARTICLE_BLOCKQUOTE_BORDER_SIZE = "4px";
const ARTICLE_BLOCKQUOTE_BORDER_COLOR = ARTICLE_TITLE_COLOR;

/** Fallback de imágenes */
const FALLBACK_IMAGE_WEBP = "/images/preview/preview.webp";
const FALLBACK_IMAGE_PNG = "/images/preview/preview.png";
const FALLBACK_IMAGE_JPG = "/images/preview/preview.jpg";

/** Datos SEO por defecto */
const FALLBACK_TITLE = "Artículo sin título";
const FALLBACK_DESCRIPTION = "Artículo de blog en Talberos";
const FALLBACK_AUTHOR = "Talberos Team";
const DEFAULT_KEYWORDS = ["Talberos", "tableros"];
const FALLBACK_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const BLOG_FOLDER_NAME = "blogs"; // Carpeta donde residen los .md / .mdx

/** Extensiones de archivos soportadas */
const FILE_EXTENSION_MD = ".md";
const FILE_EXTENSION_MDX = ".mdx";

/** ---------------------------------------------------------------------------------------------
 * getStaticPaths: Genera rutas estáticas para archivos .md o .mdx en /blogs
 * -------------------------------------------------------------------------------------------*/
export async function getStaticPaths() {
  const blogsDir = path.join(process.cwd(), BLOG_FOLDER_NAME);
  const filenames = await fs.readdir(blogsDir);

  const paths = filenames
    .filter(
      (file) => file.endsWith(FILE_EXTENSION_MD) || file.endsWith(FILE_EXTENSION_MDX)
    )
    .map((file) => ({
      params: {
        article: file.replace(/\.(md|mdx)$/, ""),
      },
    }));

  return {
    paths,
    fallback: false, // Si un path no existe, 404
  };
}

/** ---------------------------------------------------------------------------------------------
 * getStaticProps: Lee y procesa un artículo (MD o MDX) desde la carpeta /blogs.
 * -------------------------------------------------------------------------------------------*/
export async function getStaticProps({ params }) {
  const { article } = params;
  const filePathMdx = path.join(
    process.cwd(),
    BLOG_FOLDER_NAME,
    `${article}${FILE_EXTENSION_MDX}`
  );
  const filePathMd = path.join(
    process.cwd(),
    BLOG_FOLDER_NAME,
    `${article}${FILE_EXTENSION_MD}`
  );

  let fileContent = null;
  let isMdx = false;

  // Intentamos leer .mdx primero
  try {
    fileContent = await fs.readFile(filePathMdx, "utf8");
    isMdx = true;
  } catch (errMdx) {
    // Si falla, intentamos .md
    try {
      fileContent = await fs.readFile(filePathMd, "utf8");
    } catch (errMd) {
      // No hay ni .mdx ni .md -> 404
      return { notFound: true };
    }
  }

  // Extraemos frontmatter y contenido
  const { data, content } = matter(fileContent);

  // Procesamos a MDX o MD->HTML
  let mdxSource = null;
  let htmlContent = "";

  if (isMdx) {
    // Contenido MDX
    mdxSource = await serialize(content, {
      scope: data,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    });
  } else {
    // Contenido MD
    const processed = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content);
    htmlContent = processed.toString();
  }

  // URL canónica para SEO
  const pageUrl = `${FALLBACK_BASE_URL}/blog/${article}`;

  // Verificamos si la imagen (frontmatter.image) existe en /public
  let finalImageURL = null;
  if (data.image) {
    const localImagePath = path.join(process.cwd(), "public", data.image);
    try {
      await fs.access(localImagePath); // Comprueba que el archivo existe
      finalImageURL = FALLBACK_BASE_URL + data.image;
    } catch (errFile) {
      console.warn(`[ARTICLE] Imagen no encontrada en disco: ${localImagePath}`);
    }
  }

  // Estructura JSON-LD (BlogPosting) para SEO
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title || FALLBACK_TITLE,
    description: data.description || FALLBACK_DESCRIPTION,
    author: {
      "@type": "Person",
      name: data.author || FALLBACK_AUTHOR,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: data.keywords || [],
    datePublished: data.date || "",
    dateModified: data.date || "",
  };
  if (finalImageURL) {
    jsonLdData.image = finalImageURL;
  }

  return {
    props: {
      frontMatter: {
        ...data,
        image: finalImageURL || null,
      },
      mdxSource,
      htmlContent,
      pageUrl,
      jsonLdData,
      articleSlug: article,
      isMdx,
    },
  };
}

/** ---------------------------------------------------------------------------------------------
 * PAGE COMPONENT: BlogArticlePage
 * Renderiza el artículo (MD o MDX) con la misma paleta de estilos que HeroTalberos, etc.
 * -------------------------------------------------------------------------------------------*/
export default function BlogArticlePage({
  frontMatter,
  mdxSource,
  htmlContent,
  pageUrl,
  jsonLdData,
  articleSlug,
  isMdx,
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark-mode"));
    }
  }, []);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // Extraemos datos de frontMatter con fallback
  const {
    title = FALLBACK_TITLE,
    description = FALLBACK_DESCRIPTION,
    image = null,
    keywords = [],
    date = null,
    author = FALLBACK_AUTHOR,
  } = frontMatter;

  // Fusionamos las palabras clave: frontMatter + default
  const finalKeywords = Array.isArray(keywords)
    ? [...new Set([...DEFAULT_KEYWORDS, ...keywords])]
    : DEFAULT_KEYWORDS;

  // Fallback de imágenes
  const hasCustomImage = Boolean(image);
  const fallbackImageWebp = FALLBACK_BASE_URL + FALLBACK_IMAGE_WEBP;
  const fallbackImagePng = FALLBACK_BASE_URL + FALLBACK_IMAGE_PNG;
  const fallbackImageJpg = FALLBACK_BASE_URL + FALLBACK_IMAGE_JPG;

  return (
    <>
      {/* SEO HEAD TAGS */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content={author} />

        {/* Keywords */}
        {finalKeywords.length > 0 && (
          <meta name="keywords" content={finalKeywords.join(", ")} />
        )}

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

        {/* JSON-LD (BlogPosting) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />

        {/* theme-color para móviles */}
        <meta name="theme-color" content="#0d47a1" />
      </Head>

      {/* MENU PRINCIPAL */}
      <Menu />

      {/* CONTENEDOR PRINCIPAL: Gradiente de fondo y estilo unificado */}
      <Box
        component="article"
        role="article"
        aria-label={`Artículo: ${title}`}
        sx={{
          background: ARTICLE_BG_GRADIENT,
          minHeight: "100vh",
          pt: isMobile ? 10 : ARTICLE_CONTAINER_PADDING_TOP,
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: ARTICLE_CONTAINER_MAX_WIDTH,
            margin: "0 auto",
            boxShadow: ARTICLE_CONTAINER_BOX_SHADOW,
            borderRadius: ARTICLE_CONTAINER_BORDER_RADIUS,
            overflow: "hidden",
            pb: 4,
            px: isMobile ? 2 : ARTICLE_CONTAINER_PADDING_SIDE,
            background: "transparent",
          }}
        >
          {/* CABECERA DEL ARTÍCULO */}
          <header
            style={{
              textAlign: "center",
              marginBottom: ARTICLE_HEADER_MARGIN_BOTTOM,
              marginTop: ARTICLE_HEADER_MARGIN_TOP,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: ARTICLE_TITLE_FONT_SIZE,
                fontWeight: ARTICLE_TITLE_FONT_WEIGHT,
                mb: 1,
                color: ARTICLE_TITLE_COLOR,
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                component="h2"
                sx={{
                  fontSize: ARTICLE_SUBTITLE_FONT_SIZE,
                  color: ARTICLE_SUBTITLE_COLOR,
                  mb: 2,
                }}
              >
                {description}
              </Typography>
            )}

            {date && (
              <Typography
                component="p"
                sx={{ color: ARTICLE_FALLBACK_TEXT_COLOR, fontStyle: "italic" }}
              >
                {new Date(date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            )}
          </header>

          {/* IMAGEN PRINCIPAL (OPCIONAL) */}
          {hasCustomImage ? (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Image
                src={image}
                alt={`Imagen principal del artículo: ${title}`}
                layout="responsive"
                width={1200}
                height={600}
                priority
                style={{ borderRadius: 8 }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Image
                src={fallbackImagePng}
                alt="Imagen de fallback para artículos"
                layout="responsive"
                width={1200}
                height={600}
                priority
                style={{ borderRadius: 8 }}
              />
            </Box>
          )}

          {/* CONTENIDO DEL ARTÍCULO */}
          <Box
            component="section"
            sx={{
              color: ARTICLE_TEXT_COLOR,
              lineHeight: 1.7,
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                marginTop: "2rem",
                marginBottom: "1rem",
                color: ARTICLE_TEXT_COLOR,
              },
              "& p": {
                marginBottom: "1rem",
              },
              "& code": {
                backgroundColor: ARTICLE_CODE_BG_COLOR,
                color: "#000000",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.95rem",
                fontFamily:
                  "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
              },
              "& pre": {
                backgroundColor: ARTICLE_CODE_BG_COLOR,
                padding: "1rem",
                borderRadius: "8px",
                overflowX: "auto",
                marginBottom: "1.5rem",
                marginTop: "1rem",
                color: "#000000",
              },
              "& blockquote": {
                borderLeft: `${ARTICLE_BLOCKQUOTE_BORDER_SIZE} solid ${ARTICLE_BLOCKQUOTE_BORDER_COLOR}`,
                backgroundColor: ARTICLE_CODE_BG_COLOR,
                padding: "1rem 1.5rem",
                margin: "1.5rem 0",
                fontStyle: "italic",
                color: ARTICLE_BLOCKQUOTE_COLOR,
              },
            }}
          >
            {isMdx ? (
              <MDXRemote {...mdxSource} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </Box>

          {/* FOOTER DEL ARTÍCULO */}
          <footer style={{ marginTop: "2rem", textAlign: "center" }}>
            <Typography component="p" sx={{ color: ARTICLE_FALLBACK_TEXT_COLOR }}>
              © {new Date().getFullYear()} Talberos - Proyecto Open Source (MIT).
            </Typography>
          </footer>
        </Box>
      </Box>
    </>
  );
}
