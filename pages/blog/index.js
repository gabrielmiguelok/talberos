"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/blog/index.js
 *
 * DESCRIPCIÓN:
 *  - Página principal del Blog de Talberos, parte del ecosistema integral
 *    para desarrollo en React, 100% Open Source y bajo licencia MIT.
 *  - Renderiza artículos (.md / .mdx) y aplica mejores prácticas de SEO (OG tags,
 *    Twitter tags, JSON-LD), junto con varios formatos de imagen (webp, png, jpg)
 *    para mayor compatibilidad.
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Centraliza la renderización y SEO del blog.
 *  - OCP: Permite expandirse con nuevas secciones o frontmatter adicional.
 *  - LSP: Subcomponentes (Menu, etc.) intercambiables sin romper la lógica principal.
 *  - ISP: Solo brinda las props y funciones necesarias.
 *  - DIP: Depende de abstracciones (Next.js, fs, path) en lugar de implementaciones rígidas.
 *
 * LICENCIA:
 *  - Código ofrecido bajo licencia MIT.
 */

import React, { useState, useEffect } from "react";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Uso de next/image para optimizar rendimiento
import Image from "next/image";

// Componentes del ecosistema Talberos
import Menu from "../../components/landing/Menu";

// -----------------------------------------------------------------------------
// CONSTANTES DE CONFIGURACIÓN DE ESTILOS (Misma paleta que Hero/UniqueDifferentiator)
// -----------------------------------------------------------------------------

/**
 * Paleta principal:
 * - Gradiente como fondo (Hero style)
 * - Colores de texto y títulos
 * - Ajuste de tarjetas, etc.
 */
const BLOG_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
const BLOG_TEXT_COLOR = "#000000";
const BLOG_TITLE_COLOR = "#0d47a1";
const BLOG_CARD_BG_COLOR = "#FFFFFF";
const BLOG_CARD_TEXT_COLOR = "#000000";
const BLOG_LINK_COLOR = "#0d47a1";

/** Encabezado del Blog */
const BLOG_MAIN_HEADING_FONT_SIZE_MOBILE = "2rem";
const BLOG_MAIN_HEADING_FONT_SIZE_DESKTOP = "3rem";
const BLOG_MAIN_HEADING_FONT_WEIGHT = "bold";

const BLOG_SUBTITLE_FONT_SIZE = "1.2rem";
const BLOG_SUBTITLE_COLOR = "#000000"; // tono gris medio para subtítulos
const BLOG_SUBTITLE_MARGIN_BOTTOM = 3;

const BLOG_INTRO_TEXT_COLOR = "#000000"; // un gris claro para párrafos introductorios
const BLOG_INTRO_TEXT_SIZE = "1rem";
const BLOG_INTRO_MAX_WIDTH = "700px";
const BLOG_INTRO_LINE_HEIGHT = 1.6;

/** Sección de posts */
const BLOG_CARD_BORDER_RADIUS = 2;
const BLOG_CARD_BOX_SHADOW = 5;
const BLOG_CARD_HOVER_TRANSFORM = "translateY(-3px) scale(1.02)";
const BLOG_CARD_HOVER_SHADOW = "0 8px 20px rgba(0, 0, 0, 0.4)";

/** Titulares de cada post */
const BLOG_POST_TITLE_COLOR = "#1F1F1F";
const BLOG_POST_TITLE_SIZE = "1.3rem";
const BLOG_POST_TITLE_WEIGHT = "bold";

/** Texto de fecha y descripción */
const BLOG_POST_DATE_COLOR = "#666666"; // gris medio
const BLOG_POST_DESCRIPTION_COLOR = "#555555";
const BLOG_POST_DESCRIPTION_LINE_HEIGHT = 1.6;

/** Enlace "Leer más" */
const BLOG_READ_MORE_COLOR = BLOG_LINK_COLOR;
const BLOG_READ_MORE_WEIGHT = "bold";

/** Dimensiones de contenedor */
const MAX_CONTENT_WIDTH = 1200;

/** SEO y meta */
const BLOG_TITLE = "Blog de Talberos";
const BLOG_DESCRIPTION =
  "Bienvenido al Blog de Talberos, parte del ecosistema integral en React, 100% Open Source (MIT). Conoce las novedades y guías técnicas de nuestras herramientas.";
const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const BLOG_IMAGE_WEBP = "/images/preview.webp";
const BLOG_IMAGE_PNG = "/images/preview.png";
const BLOG_IMAGE_JPG = "/images/preview.jpg";

const BLOG_KEYWORDS =
  "Talberos, Blog, React, Next.js, Tableros, Open Source, MIT, Desarrollo, JavaScript, Ecosistema";

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL: BlogIndexPage
// -----------------------------------------------------------------------------
export default function BlogIndexPage({ posts }) {
  // HOOKS Y ESTADOS
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detecta si el sitio está en modo oscuro (si tuvieras clases en <html>).
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark-mode"));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // SEO: URL CANÓNICA Y JSON-LD
  // ---------------------------------------------------------------------------
  const pageUrl = `${BLOG_BASE_URL}/blog`;
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
  };

  // ---------------------------------------------------------------------------
  // RENDER DEL COMPONENTE
  // ---------------------------------------------------------------------------
  return (
    <>
      <Head>
        {/* SEO HEAD PRINCIPAL */}
        <title>{BLOG_TITLE}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
        <meta name="keywords" content={BLOG_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content="Talberos Ecosystem" />

        {/* Open Graph (OG) - múltiples imágenes para fallback */}
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

        {/* Datos estructurados (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />

        {/* Favicons y variantes */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* theme-color para móviles (usa un color base de la paleta) */}
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
          {/* Contenedor interno */}
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
            {/* ENCABEZADO: PRESENTACIÓN DEL BLOG */}
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
              </Typography>
            </Box>

            {/* LISTA DE POSTS EN FORMATO GRID */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 3,
              }}
            >
              {posts.map((post) => (
                <Box
                  key={post.slug}
                  sx={{
                    backgroundColor: BLOG_CARD_BG_COLOR,
                    color: BLOG_CARD_TEXT_COLOR,
                    boxShadow: BLOG_CARD_BOX_SHADOW,
                    borderRadius: BLOG_CARD_BORDER_RADIUS,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    minHeight: "320px",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: BLOG_CARD_HOVER_TRANSFORM,
                      boxShadow: BLOG_CARD_HOVER_SHADOW,
                    },
                  }}
                >
                  {/* IMAGEN DEL POST (usar next/image para optimizar) */}
                  {post.frontMatter.image && (
                    <Box sx={{ width: "100%", height: "180px", position: "relative" }}>
                      <Image
                        src={post.frontMatter.image}
                        alt={post.frontMatter.title || "Imagen del artículo"}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  )}

                  {/* CONTENIDO DEL POST */}
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{
                        fontSize: BLOG_POST_TITLE_SIZE,
                        mb: 1,
                        fontWeight: BLOG_POST_TITLE_WEIGHT,
                        color: BLOG_POST_TITLE_COLOR,
                      }}
                    >
                      {post.frontMatter.title}
                    </Typography>

                    {post.frontMatter.date && (
                      <Typography
                        component="p"
                        sx={{
                          fontSize: "0.875rem",
                          color: BLOG_POST_DATE_COLOR,
                          mb: 1,
                        }}
                      >
                        {new Date(post.frontMatter.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    )}

                    {post.frontMatter.description && (
                      <Typography
                        component="p"
                        sx={{
                          mb: 2,
                          flexGrow: 1,
                          color: BLOG_POST_DESCRIPTION_COLOR,
                          lineHeight: BLOG_POST_DESCRIPTION_LINE_HEIGHT,
                          fontSize: "0.95rem",
                        }}
                      >
                        {post.frontMatter.description}
                      </Typography>
                    )}

                    {/* ENLACE LEER MÁS */}
                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                        <a
                          style={{
                            color: BLOG_READ_MORE_COLOR,
                            fontWeight: BLOG_READ_MORE_WEIGHT,
                            textDecoration: "none",
                          }}
                          aria-label={`Leer más sobre: ${post.frontMatter.title}`}
                        >
                          Leer más →
                        </a>
                      </Link>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* PIE DE PÁGINA */}
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

// -----------------------------------------------------------------------------
// getStaticProps: LEE FICHEROS .MD Y .MDX EN LA CARPETA /blogs
// -----------------------------------------------------------------------------
export async function getStaticProps() {
  const blogsDir = path.join(process.cwd(), "blogs");
  let files = [];

  // Lectura de la carpeta /blogs
  try {
    files = await fs.readdir(blogsDir);
  } catch (error) {
    console.error("[BLOG INDEX] Error leyendo la carpeta /blogs:", error);
    return { props: { posts: [] } };
  }

  // Filtra solo archivos .md o .mdx
  const markdownFiles = files.filter(
    (file) => file.endsWith(".md") || file.endsWith(".mdx")
  );

  // Array para acumular posts
  const posts = [];

  // Procesa cada archivo .md/.mdx
  for (const file of markdownFiles) {
    const fullPath = path.join(blogsDir, file);

    // Extrae orden numérico al inicio del nombre (e.g. "10." => 10)
    let fileOrder = 0;
    const matchOrder = file.match(/^(\d+)\./);
    if (matchOrder && matchOrder[1]) {
      fileOrder = parseInt(matchOrder[1], 10);
    }

    try {
      const fileContent = await fs.readFile(fullPath, "utf8");
      const { data } = matter(fileContent);

      posts.push({
        slug: file.replace(/\.(md|mdx)$/, ""), // Genera el slug sin extensión
        order: fileOrder,
        frontMatter: {
          title: data.title || "Artículo sin título",
          description: data.description || "",
          image: data.image || null,
          date: data.date || null,
        },
      });
    } catch (err) {
      console.error(`[BLOG INDEX] Error procesando ${file}:`, err);
    }
  }

  // Orden descendente por "order" extraído del nombre del archivo
  posts.sort((a, b) => b.order - a.order);

  // Retorna los posts como props
  return {
    props: { posts },
  };
}
