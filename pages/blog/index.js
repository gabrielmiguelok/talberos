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

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// **** Uso de next/image para optimizar rendimiento ****
import Image from 'next/image';

// Componentes del ecosistema Talberos
import Menu from '../../components/landing/Menu';

// -----------------------------------------------------------------------------
// CONSTANTES PARA SEO Y ESTILO
// -----------------------------------------------------------------------------
const BLOG_TITLE = 'Blog de Talberos';
const BLOG_DESCRIPTION =
  'Bienvenido al Blog de Talberos, parte del ecosistema integral en React, 100% Open Source (MIT). Conoce las novedades y guías técnicas de nuestras herramientas.';
const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/** Imagen principal (varios formatos) */
const BLOG_IMAGE_WEBP = '/images/preview.webp';
const BLOG_IMAGE_PNG = '/images/preview.png';
const BLOG_IMAGE_JPG = '/images/preview.jpg';

/** Palabras clave para SEO */
const BLOG_KEYWORDS =
  'Talberos, Blog, React, Next.js, Tableros, Open Source, MIT, Desarrollo, JavaScript, Ecosistema';

// Colores y estilos (modo oscuro por defecto)
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
export default function BlogIndexPage({ posts }) {
  // HOOKS Y ESTADOS
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
      <Head>
        {/* SEO HEAD PRINCIPAL */}
        <title>{BLOG_TITLE}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
        <meta name="keywords" content={BLOG_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content="Talberos Ecosystem" />

        {/* Open Graph (OG) - múltiples imágenes para aumentar fallback */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={BLOG_TITLE} />
        <meta property="og:description" content={BLOG_DESCRIPTION} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={BLOG_IMAGE_WEBP} />
        <meta property="og:image" content={BLOG_IMAGE_PNG} />
        <meta property="og:image" content={BLOG_IMAGE_JPG} />

        {/* Twitter Card: añadimos varias imágenes similares */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BLOG_TITLE} />
        <meta name="twitter:description" content={BLOG_DESCRIPTION} />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:image" content={BLOG_IMAGE_WEBP} />
        <meta name="twitter:image" content={BLOG_IMAGE_PNG} />
        <meta name="twitter:image" content={BLOG_IMAGE_JPG} />

        {/* Datos estructurados (JSON-LD) para describir el Blog */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
        />

        {/*
          Favicons y variantes para distintas resoluciones
          Ajusta las rutas si tienes un directorio /public/favicons.
        */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/*
          theme-color para móviles, asume modo oscuro base (#1F1F1F).
          Cambia el valor si tu branding requiere otro color principal.
        */}
        <meta name="theme-color" content="#1F1F1F" />
      </Head>

      {/* MENÚ PRINCIPAL (modo oscuro o claro controlado externamente) */}
      <Menu />

      {/* CONTENIDO PRINCIPAL */}
      <main>
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
              {/* H1 para accesibilidad */}
              <Typography
                component="h1"
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

              {/* Subtítulo con color distinto según modo */}
              <Typography
                component="h2"
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
                component="p"
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
                <strong>Open Source (MIT)</strong>. El código que genera este sitio
                te permite una renderización automática y optimizada para SEO. Siéntete
                libre de ajustarlo a tus necesidades, integrando soluciones tipo
                “tableros” y mucho más.
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
                  {/* IMAGEN DEL POST (usar next/image para optimizar) */}
                  {post.frontMatter.image && (
                    <Box sx={{ width: '100%', height: '180px', position: 'relative' }}>
                      <Image
                        src={post.frontMatter.image}
                        alt={post.frontMatter.title || 'Imagen del artículo'}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  {/* CONTENIDO DEL POST */}
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: '1.3rem',
                        mb: 1,
                        fontWeight: 'bold',
                        color: '#fff',
                      }}
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
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography variant="body2" sx={{ color: '#999' }}>
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
