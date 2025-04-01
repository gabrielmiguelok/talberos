/************************************************************************************************
 * FILE: ./pages/blog/[article].js
 * LICENSE: MIT
 *
 * DESCRIPTION:
 *   - Página dinámica para renderizar artículos .md o .mdx desde la carpeta /blogs en Talberos.
 *   - Estilos pensados para modo oscuro, con tipografías agradables y resaltado de código.
 *   - Incorpora el componente Menu para la barra de navegación.
 *   - Soporta SEO a través de metadatos, OG, Twitter, JSON-LD (BlogPosting).
 *   - Utiliza SSR (Static Site Generation) con getStaticPaths y getStaticProps para
 *     prerenderizar cada artículo.
 *   - Aplica los principios SOLID y Clean Code:
 *       * SRP: Maneja solo la carga y visualización de un artículo individual.
 *       * OCP: Se puede ampliar funcionalidad sin modificar su base.
 *       * LSP: Se pueden sustituir partes (ej. parseo MDX) sin romper la interfaz.
 *       * ISP: El componente expone props claras y específicas (frontMatter, mdxSource, etc.).
 *       * DIP: El origen de datos (archivos locales) está desacoplado, se inyecta vía SSR.
 ************************************************************************************************/

/** ------------------------- IMPORTS & DEPENDENCIES ------------------------------------------- */
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

/** ------------------------- CONSTANTES DE CONFIGURACIÓN -------------------------------------- */

/**
 * Rutas y nombres de archivo
 */
const BLOG_FOLDER_NAME = 'blogs'; // Carpeta donde residen los .md y .mdx
const FILE_EXTENSION_MD = '.md';
const FILE_EXTENSION_MDX = '.mdx';

/**
 * Estilos y opciones de diseño
 */
const ARTICLE_CONTAINER_MAX_WIDTH = 1200;
const ARTICLE_CONTAINER_PADDING_TOP = 10;
const ARTICLE_CONTAINER_PADDING_SIDE = 3;
const ARTICLE_TITLE_FONT_SIZE = '2.5rem';
const ARTICLE_CONTAINER_BOX_SHADOW = 7;
const ARTICLE_CONTAINER_BORDER_RADIUS = 0;

/**
 * Colores y fondo para modo oscuro
 */
const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const TITLE_COLOR = '#FF00AA';
const SUBTITLE_COLOR = '#CCC';
const CARD_BG_COLOR = '#1F1F1F';

/**
 * Variables SEO y fallback
 */
const FALLBACK_TITLE = 'Artículo sin título';
const FALLBACK_DESCRIPTION = 'Artículo de blog en Talberos';
const FALLBACK_AUTHOR = 'Talberos Team';
const FALLBACK_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * IMPORT DINÁMICO:
 * Cargamos el Menu sin SSR para poder usar hooks de cliente (useState, etc.)
 * en su implementación.
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
    fallback: false, // Si un path no está generado, muestra 404
  };
}

/**
 * Lee y procesa un artículo (MD o MDX) desde la carpeta /blogs
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
      // Si no se encuentra ni .mdx ni .md, devolvemos 404
      return { notFound: true };
    }
  }

  // Extraemos frontmatter y contenido raw
  const { data, content } = matter(fileContent);

  // Convertimos a MDX o MD->HTML
  let mdxSource = null;
  let htmlContent = '';

  if (isMdx) {
    // Procesamos contenido MDX
    mdxSource = await serialize(content, {
      scope: data,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    });
  } else {
    // Procesamos contenido MD a HTML con Remark
    const processed = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content);
    htmlContent = processed.toString();
  }

  // URL canónica (para SEO y redes)
  const pageUrl = `${FALLBACK_BASE_URL}/blog/${article}`;

  // Chequeamos si la imagen (definida en frontmatter) está en /public
  let finalImageURL = null;
  if (data.image) {
    const localImagePath = path.join(process.cwd(), 'public', data.image);
    try {
      await fs.access(localImagePath);
      finalImageURL = FALLBACK_BASE_URL + data.image;
    } catch (errFile) {
      // Imagen no encontrada en /public, logueamos error
      console.error(`Imagen no encontrada en disco: ${localImagePath}`);
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

/** ------------------------- PAGE COMPONENT ---------------------------------------------------- */

/**
 * BlogArticlePage
 *
 * @param {Object} props
 * @param {Object} props.frontMatter - Metadatos del artículo (title, description, keywords, image, date, author, etc.)
 * @param {string} props.mdxSource   - Contenido serializado si es MDX
 * @param {string} props.htmlContent - Contenido HTML si es MD
 * @param {string} props.pageUrl     - URL canónica para SEO
 * @param {Object} props.jsonLdData  - Datos estructurados (BlogPosting) para SEO
 * @param {string} props.articleSlug - Slug del artículo
 * @param {boolean} props.isMdx      - Indica si el contenido original es .mdx
 *
 * @returns {JSX.Element} Render de la página de artículo, con menús, metadatos y contenido.
 */
export default function BlogArticlePage({
  frontMatter,
  mdxSource,
  htmlContent,
  pageUrl,
  jsonLdData,
  articleSlug,
  isMdx,
}) {
  // Hook de Next Router para manejo de estados de carga
  const router = useRouter();

  // Hooks de MUI para tema y detección de viewport (ej. mobile vs desktop)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado local para detectar si el documento está en modo oscuro (opcional)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efecto para sincronizar con la clase 'dark-mode' en <html> si existe
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
  } = frontMatter;

  return (
    <>
      {/* SEO HEAD TAGS */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph (OG) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        {image && <meta property="og:image" content={image} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}

        {/* Keywords */}
        {Array.isArray(keywords) && keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(', ')} />
        )}

        {/* JSON-LD para artículos (BlogPosting) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
        />
      </Head>

      {/* Menú principal de la aplicación */}
      <Menu />

      {/* CONTENEDOR PRINCIPAL */}
      <Box
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
              variant="h2"
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
                variant="h3"
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
          {image && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img
                src={image}
                alt={title}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          )}

          {/* CONTENIDO DEL ARTÍCULO */}
          <Box
            component="main"
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
              // Si es .mdx, renderizamos con <MDXRemote />
              <MDXRemote {...mdxSource} />
            ) : (
              // Si es .md, inyectamos el HTML con dangerouslySetInnerHTML
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
