/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/blog/index.js
 *
 * DESCRIPCIÓN:
 *  - Página principal del Blog de Talberos, parte del ecosistema integral
 *    para desarrollo en React, 100% Open Source y bajo licencia MIT.
 *  - Renderiza artículos (archivos .md o .mdx) de forma automatizada y optimizada para SEO,
 *    mostrando una vista dinámica y ordenada de forma descendente según el número
 *    con el que inicia cada archivo.
 *  - Aplica Principios SOLID y Clean Code:
 *     * SRP: Se encarga exclusivamente de mostrar la lista de artículos.
 *     * OCP: Admite más filtros o paginación sin alterar la estructura base.
 *     * DIP: El origen de los artículos (archivos locales, API) está abstraído
 *       mediante getStaticProps.
 *
 * COMPONENTES:
 *  - BlogIndexPage: Renderiza la lista de artículos en un grid dinámico.
 *  - getStaticProps: Lee los archivos de /blogs, parsea frontmatter con "matter"
 *    y ordena los posts de forma descendente por el número inicial en el nombre
 *    del archivo.
 *
 * AUTODOCUMENTACIÓN:
 *  - Las secciones y variables principales están definidas con constantes y
 *    comentarios detallados para facilitar la edición y refactorización.
 * ----------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';

// -----------------------------------------------------------------------------
// CARGA DINÁMICA DE COMPONENTES
// -----------------------------------------------------------------------------
/**
 * Cargamos el componente "Menu" de forma dinámica para habilitar "use client".
 * De esta manera, evitamos cualquier problema con el SSR de Next.js.
 */
const Menu = dynamic(() => import('@components/landing/Menu'), { ssr: false });

// -----------------------------------------------------------------------------
// CONSTANTES GLOBALES PARA SEO Y ESTILO
// -----------------------------------------------------------------------------
/**
 * Título y descripción genéricos para SEO (Open Graph, Twitter, JSON-LD).
 */
const BLOG_TITLE = 'Blog de Talberos';
const BLOG_DESCRIPTION =
  'Bienvenido al Blog de Talberos, parte del ecosistema integral en React, 100% Open Source (MIT). Conoce las novedades y guías técnicas de nuestras herramientas.';
const BLOG_OG_IMAGE = '/blog.jpeg'; // Actualiza con tu imagen
const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Paleta de colores y ajustes de diseño.
 */
const CONTAINER_BG_COLOR = '#121212';
const CARD_BG_COLOR = '#1F1F1F';
const TITLE_COLOR = '#FF00AA';
const TEXT_COLOR = '#FFFFFF';
const SUBTITLE_DARK_COLOR = '#ccc';
const SUBTITLE_LIGHT_COLOR = '#555';
const MAX_CONTENT_WIDTH = 1200;

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL: BlogIndexPage
// -----------------------------------------------------------------------------
/**
 * BlogIndexPage - Renderiza la vista principal del blog, mostrando la lista
 * de artículos y aplicando un diseño oscuro. Presenta un encabezado que explica
 * que esta página forma parte del ecosistema Open Source de Talberos.
 *
 * @param {{ posts: Array<{ slug: string, frontMatter: any }>}} props
 * @returns {JSX.Element}
 */
export default function BlogIndexPage({ posts }) {
  // ---------------------------------------------------------------------------
  // HOOKS Y ESTADOS
  // ---------------------------------------------------------------------------
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // SEO: URL CANÓNICA Y JSON-LD
  // ---------------------------------------------------------------------------
  const pageUrl = `${BLOG_BASE_URL}/blog`;

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
  };

  // ---------------------------------------------------------------------------
  // CÁLCULOS DE COLORES Y ESTILOS EN BASE AL MODO OSCURO
  // ---------------------------------------------------------------------------
  const subtitleColor = isDarkMode ? SUBTITLE_DARK_COLOR : SUBTITLE_LIGHT_COLOR;

  // ---------------------------------------------------------------------------
  // RENDER DEL COMPONENTE
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* SEO HEAD */}
      <Head>
        <title>{BLOG_TITLE}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={BLOG_TITLE} />
        <meta property="og:description" content={BLOG_DESCRIPTION} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={BLOG_OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BLOG_TITLE} />
        <meta name="twitter:description" content={BLOG_DESCRIPTION} />
        <meta name="twitter:image" content={BLOG_OG_IMAGE} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>

      {/* MENÚ PRINCIPAL (acoplado de forma dinámica) */}
      <Menu />

      {/* CONTENEDOR PRINCIPAL */}
      <Box
        sx={{
          backgroundColor: CONTAINER_BG_COLOR,
          position: 'relative',
          minHeight: '100vh',
          pt: isMobile ? 10 : 12,
          pb: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: MAX_CONTENT_WIDTH,
            margin: '0 auto',
            backgroundColor: CONTAINER_BG_COLOR,
            px: isMobile ? 2 : 3,
            color: TEXT_COLOR,
          }}
        >
          {/* ENCABEZADO: PRESENTACIÓN DEL BLOG Y EL ECOSISTEMA TALBEROS */}
          <Box sx={{ textAlign: 'center', mb: 5, mt: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 'bold',
                mb: 2,
                color: TITLE_COLOR,
              }}
            >
              {BLOG_TITLE}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: '1.2rem',
                color: subtitleColor,
                mb: 3,
              }}
            >
              {BLOG_DESCRIPTION}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                maxWidth: '700px',
                margin: '0 auto',
                color: '#bbb',
                lineHeight: 1.6,
              }}
            >
              Esta página de blog es parte de <strong>Talberos</strong>, un
              ecosistema integral para desarrollo en React, totalmente{' '}
              <strong>Open Source (MIT)</strong>. El codigo que genera este sitio que
              ves aquí te permite una renderización automática y optimizada
              para SEO. Puedes utilizarlo tal cual, o personalizarlo para
              adaptarlo a tu marca y necesidades.
            </Typography>
          </Box>

          {/* LISTA DE POSTS EN FORMATO GRID */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
              gap: 3,
            }}
          >
            {posts.map((post) => (
              <Box
                key={post.slug}
                sx={{
                  backgroundColor: CARD_BG_COLOR,
                  boxShadow: 5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minHeight: '320px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                  },
                }}
              >
                {/* IMAGEN (OPCIONAL) */}
                {post.frontMatter.image && (
                  <Box sx={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={post.frontMatter.image}
                      alt={post.frontMatter.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}

                {/* CONTENIDO DEL POST */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography
                    variant="h2"
                    sx={{ fontSize: '1.3rem', mb: 1, fontWeight: 'bold', color: '#fff' }}
                  >
                    {post.frontMatter.title}
                  </Typography>

                  {post.frontMatter.date && (
                    <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                      {new Date(post.frontMatter.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Typography>
                  )}

                  {post.frontMatter.description && (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        flexGrow: 1,
                        color: '#ccc',
                        lineHeight: 1.6,
                      }}
                    >
                      {post.frontMatter.description}
                    </Typography>
                  )}

                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                      <a
                        style={{
                          color: TITLE_COLOR,
                          fontWeight: 'bold',
                          textDecoration: 'none',
                        }}
                      >
                        Leer más →
                      </a>
                    </Link>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* PIE DE PÁGINA (OPCIONAL) */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              © {new Date().getFullYear()} Talberos. Proyecto Open Source - MIT.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// -----------------------------------------------------------------------------
// getStaticProps: LEE FICHEROS .MD Y .MDX EN LA CARPETA /blogs
// -----------------------------------------------------------------------------
/**
 * getStaticProps
 * - Lee los archivos .md y .mdx en /blogs, extrae el frontmatter con "matter"
 *   y genera la lista de publicaciones "posts".
 * - Ordena los artículos de forma DESCENDENTE según el número con el que
 *   empieza el nombre del archivo (e.g.: "10.Nombre.md" se mostrará antes
 *   que "2.Nombre.md").
 * - Si el archivo no comienza con un número, se asume "0" como orden.
 *
 * @returns {Promise<{ props: { posts: Array<{ slug: string, frontMatter: any }> } }>}
 */
export async function getStaticProps() {
  const blogsDir = path.join(process.cwd(), 'blogs');
  let files = [];

  // Lectura de la carpeta /blogs
  try {
    files = await fs.readdir(blogsDir);
  } catch (error) {
    console.error('[BLOG INDEX] Error leyendo la carpeta /blogs:', error);
    return { props: { posts: [] } };
  }

  // Filtra solo archivos .md o .mdx
  const markdownFiles = files.filter(
    (file) => file.endsWith('.md') || file.endsWith('.mdx')
  );

  // Array para acumular posts
  const posts = [];

  // Procesa cada archivo .md / .mdx
  for (const file of markdownFiles) {
    const fullPath = path.join(blogsDir, file);

    // Extrae orden numérico al inicio del nombre (e.g. "10." => 10)
    let fileOrder = 0;
    const matchOrder = file.match(/^(\d+)\./);
    if (matchOrder && matchOrder[1]) {
      fileOrder = parseInt(matchOrder[1], 10);
    }

    try {
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(fileContent);

      posts.push({
        slug: file.replace(/\.(md|mdx)$/, ''), // Genera el slug sin extensión
        order: fileOrder,
        frontMatter: {
          title: data.title || 'Artículo sin título',
          description: data.description || '',
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
