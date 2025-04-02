/************************************************************************************************
 * FILE: ./pages/blog/[article].js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   - Página dinámica para renderizar artículos .md o .mdx desde /blogs en Talberos.
 *   - Si el artículo no define una imagen en frontmatter, se usan fallbacks (preview.webp, .png, .jpg).
 *   - Incorpora SEO avanzado (Open Graph, Twitter), con múltiples formatos de imagen para
 *     maximizar compatibilidad.
 *   - Aplica SSG (getStaticPaths & getStaticProps) para prerenderizar cada artículo.
 *   - Usa next/image para optimizar la imagen principal.
 *   - Mantiene principios SOLID y Clean Code.
 ************************************************************************************************/

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import Image from 'next/image';

/** ------------------------- CONSTANTES DE CONFIGURACIÓN -------------------------------------- */

// Carpeta donde residen los .md y .mdx
const BLOG_FOLDER_NAME = 'blogs';

// Extensiones posibles
const FILE_EXTENSION_MD = '.md';
const FILE_EXTENSION_MDX = '.mdx';

// Estilos / diseño
const ARTICLE_CONTAINER_MAX_WIDTH = 1200;
const ARTICLE_CONTAINER_PADDING_TOP = 10;
const ARTICLE_CONTAINER_PADDING_SIDE = 3;
const ARTICLE_TITLE_FONT_SIZE = '2.5rem';
const ARTICLE_CONTAINER_BOX_SHADOW = 7;
const ARTICLE_CONTAINER_BORDER_RADIUS = 0;

const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const TITLE_COLOR = '#FF00AA';
const SUBTITLE_COLOR = '#CCC';
const CARD_BG_COLOR = '#1F1F1F';

// Variables SEO y fallback
const FALLBACK_TITLE = 'Artículo sin título';
const FALLBACK_DESCRIPTION = 'Artículo de blog en Talberos';
const FALLBACK_AUTHOR = 'Talberos Team';
const FALLBACK_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Imágenes fallback en /public/images/preview
 * para usarlas cuando un post no define su propia imagen.
 */
const FALLBACK_IMAGES = {
  webp: '/images/preview.webp',
  png: '/images/preview.png',
  jpg: '/images/preview.jpg',
};

/**
 * Palabras clave base que siempre se añaden a las del frontmatter
 */
const DEFAULT_KEYWORDS = ['Talberos', 'tableros'];

/**
 * IMPORT DINÁMICO:
 * Cargamos el Menu sin SSR para poder usar hooks de cliente (useState, etc.)
 * en su implementación, mejorando además la performance inicial del SSR.
 */
const Menu = dynamic(() => import('../../components/landing/Menu'), {
  ssr: false,
});

/** ------------------------- STATIC GENERATION FUNCTIONS --------------------------------------- */

/**
 * Genera rutas estáticas para todos los archivos .md o .mdx en /blogs
 */
export async function getStaticPaths() {
  const blogsDir = path.join(process.cwd(), BLOG_FOLDER_NAME);
  const filenames = await fs.readdir(blogsDir);

  const paths = filenames
    .filter((file) => file.endsWith(FILE_EXTENSION_MD) || file.endsWith(FILE_EXTENSION_MDX))
    .map((file) => ({
      params: {
        article: file.replace(/\.(md|mdx)$/, ''),
      },
    }));

  return {
    paths,
    fallback: false, // Si un path no existe, 404
  };
}

/**
 * Lee y procesa un artículo (MD o MDX) desde la carpeta /blogs.
 * Devuelve props que serán inyectadas en el componente de página.
 */
export async function getStaticProps({ params }) {
  const { article } = params;
  const filePathMdx = path.join(process.cwd(), BLOG_FOLDER_NAME, `${article}${FILE_EXTENSION_MDX}`);
  const filePathMd = path.join(process.cwd(), BLOG_FOLDER_NAME, `${article}${FILE_EXTENSION_MD}`);

  let fileContent = null;
  let isMdx = false;

  // Intentamos leer .mdx primero
  try {
    fileContent = await fs.readFile(filePathMdx, 'utf8');
    isMdx = true;
  } catch (errMdx) {
    // Si falla, intentamos .md
    try {
      fileContent = await fs.readFile(filePathMd, 'utf8');
    } catch (errMd) {
      // No hay ni .mdx ni .md -> 404
      return { notFound: true };
    }
  }

  // Extraemos frontmatter y contenido
  const { data, content } = matter(fileContent);

  // Procesamos a MDX o MD->HTML
  let mdxSource = null;
  let htmlContent = '';

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
  // De lo contrario, guardamos null y luego usaremos fallback en la view.
  let finalImageURL = null;
  if (data.image) {
    const localImagePath = path.join(process.cwd(), 'public', data.image);
    try {
      await fs.access(localImagePath); // Comprueba que el archivo existe
      finalImageURL = FALLBACK_BASE_URL + data.image;
    } catch (errFile) {
      console.warn(`[ARTICLE] Imagen no encontrada en disco: ${localImagePath}`);
    }
  }

  // Estructura JSON-LD (BlogPosting) para SEO
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title || FALLBACK_TITLE,
    description: data.description || FALLBACK_DESCRIPTION,
    author: {
      '@type': 'Person',
      name: data.author || FALLBACK_AUTHOR,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    keywords: data.keywords || [],
    datePublished: data.date || '',
    dateModified: data.date || '',
  };

  if (finalImageURL) {
    jsonLdData.image = finalImageURL;
  }

  return {
    props: {
      frontMatter: {
        ...data,
        image: finalImageURL || null, // Guardamos la URL final o null
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
 * Renderiza el artículo (MD o MDX) con SEO, fallback de imágenes, etc.
 * --------------------------------------------------------------------------------------------*/
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
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

  // Si NO hay imagen del artículo (image == null), usamos fallback
  const hasCustomImage = Boolean(image);
  const fallbackImageWebp = FALLBACK_BASE_URL + FALLBACK_IMAGES.webp;
  const fallbackImagePng = FALLBACK_BASE_URL + FALLBACK_IMAGES.png;
  const fallbackImageJpg = FALLBACK_BASE_URL + FALLBACK_IMAGES.jpg;

  return (
    <>
      {/* SEO HEAD TAGS */}
      <Head>
        {/* Título y descripción */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* Indexación */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        {/* Autor */}
        <meta name="author" content={author} />

        {/* Keywords (frontmatter + default) */}
        {finalKeywords.length > 0 && (
          <meta name="keywords" content={finalKeywords.join(', ')} />
        )}

        {/* Open Graph (OG) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />

        {hasCustomImage ? (
          // Si el post define su propia imagen
          <meta property="og:image" content={image} />
        ) : (
          // Si no, añadimos múltiples OG images (webp, png, jpg) como fallback
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

        {/* JSON-LD para artículos (BlogPosting) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />

        {/*
          Ejemplo de favicons si deseas colocarlos aquí (alternativa a _document.js).
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
          <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        */}

        {/* theme-color para navegadores móviles (modo oscuro por defecto) */}
        <meta name="theme-color" content="#1F1F1F" />
      </Head>

      {/* Menu principal (cargado dinámicamente) */}
      <Menu />

      {/* CONTENEDOR PRINCIPAL */}
      <Box
        component="article"
        role="article"
        aria-label={`Artículo: ${title}`}
        sx={{
          backgroundColor: BACKGROUND_COLOR,
          minHeight: '100vh',
          pt: isMobile ? 10 : ARTICLE_CONTAINER_PADDING_TOP,
          color: TEXT_COLOR,
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: ARTICLE_CONTAINER_MAX_WIDTH,
            margin: '0 auto',
            backgroundColor: BACKGROUND_COLOR,
            boxShadow: ARTICLE_CONTAINER_BOX_SHADOW,
            borderRadius: ARTICLE_CONTAINER_BORDER_RADIUS,
            overflow: 'hidden',
            pb: 4,
            px: isMobile ? 2 : ARTICLE_CONTAINER_PADDING_SIDE,
          }}
        >
          {/* CABECERA DEL ARTÍCULO */}
          <header
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              marginTop: '2rem',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: ARTICLE_TITLE_FONT_SIZE,
                fontWeight: 'bold',
                mb: 1,
                color: TITLE_COLOR,
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                variant="h2"
                sx={{
                  fontSize: '1.2rem',
                  color: SUBTITLE_COLOR,
                  mb: 2,
                }}
              >
                {description}
              </Typography>
            )}

            {date && (
              <Typography
                variant="body2"
                sx={{ color: '#888', fontStyle: 'italic' }}
              >
                {new Date(date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </header>

          {/* IMAGEN PRINCIPAL (OPCIONAL) */}
          {hasCustomImage ? (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
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
            // Si NO hay imagen del artículo, usamos fallback (ej: .png)
            <Box sx={{ textAlign: 'center', mb: 4 }}>
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
              lineHeight: 1.7,
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                marginTop: '2rem',
                marginBottom: '1rem',
                color: TEXT_COLOR,
              },
              '& p': {
                marginBottom: '1rem',
              },
              '& code': {
                backgroundColor: CARD_BG_COLOR,
                color: '#eee',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontFamily:
                  'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
              },
              '& pre': {
                backgroundColor: CARD_BG_COLOR,
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                marginTop: '1rem',
              },
              '& blockquote': {
                borderLeft: `4px solid ${TITLE_COLOR}`,
                backgroundColor: CARD_BG_COLOR,
                padding: '1rem 1.5rem',
                margin: '1.5rem 0',
                fontStyle: 'italic',
                color: '#ccc',
              },
            }}
          >
            {isMdx ? (
              // Si es .mdx, renderizamos con MDXRemote
              <MDXRemote {...mdxSource} />
            ) : (
              // Si es .md, inyectamos el HTML
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </Box>

          {/* FOOTER DEL ARTÍCULO */}
          <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              © {new Date().getFullYear()} Talberos - Proyecto Open Source.
            </Typography>
          </footer>
        </Box>
      </Box>
    </>
  );
}
