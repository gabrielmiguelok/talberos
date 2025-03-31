/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/blog/index.js
 *
 * DESCRIPCIÓN:
 *  - Página principal del Blog de Talberos, donde se listan artículos
 *    (archivo .md o .mdx) con un diseño oscuro, y se usa el nuevo Menú
 *    con el botón "Blog" ya incorporado.
 *  - Implementa SEO con metadatos (Open Graph, Twitter, JSON-LD).
 *  - Aplica Principios SOLID y Clean Code:
 *     * SRP: Se encarga exclusivamente de mostrar la lista de posts.
 *     * OCP: Admite más filtros o paginación sin alterar la estructura básica.
 *     * DIP: El origen de los posts (sistema de archivos, API) está abstraído
 *       en un getStaticProps o en otro sistema.
 *
 * COMPONENTES:
 *  - BlogIndexPage: renderiza la lista de artículos
 *  - getStaticProps: lee los archivos de /blogs y parsea frontmatter con matter.
 *
 * AUTODOCUMENTACIÓN:
 *  - Las secciones y variables están descriptas con comentarios detallados.
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

// Cargamos el componente Menu de forma dinámica (usa 'use client')
const Menu = dynamic(() => import('@components/landing/Menu'), { ssr: false });

/**
 * Paleta y constantes para el SEO del Blog
 */
const BLOG_TITLE = 'Blog de Talberos';
const BLOG_DESCRIPTION = 'Novedades, artículos técnicos y ejemplos de uso en la librería Talberos (MIT).';
const BLOG_OG_IMAGE = '/imagenes/talberos-blog-og.jpg'; // Actualiza con tu imagen
const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// -----------------------------------------------------------------------------
// Componente principal: BlogIndexPage
// -----------------------------------------------------------------------------
/**
 * BlogIndexPage
 * @param {{ posts: Array<{ slug: string, frontMatter: any }>}} props
 * @returns {JSX.Element}
 */
export default function BlogIndexPage({ posts }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Detecta si el documento está en modo oscuro (podrías leer un estado global)
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
    }
  }, []);

  // URL canónica
  const pageUrl = `${BLOG_BASE_URL}/blog`;

  // JSON-LD para "Blog" (Schema.org)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
  };

  // ---------------------------------------------------------------------------
  // Colores y estilo
  // ---------------------------------------------------------------------------
  const containerBackgroundColor = '#121212';
  const cardBackgroundColor = '#1F1F1F';
  const titleColor = '#FF00AA';
  const textColor = '#FFFFFF';
  const subtitleColor = isDarkMode ? '#ccc' : '#555';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
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

      {/* Menú principal (Acoplado/desacoplado) */}
      <Menu />

      {/* Contenedor principal con fondo oscuro */}
      <Box
        sx={{
          backgroundColor: containerBackgroundColor,
          position: 'relative',
          minHeight: '100vh',
          pt: isMobile ? 10 : 12,
          pb: 4,
        }}
      >
        {/* Sección donde se mostrarán los artículos */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            backgroundColor: containerBackgroundColor,
            px: isMobile ? 2 : 3,
            color: textColor,
          }}
        >
          {/* Encabezado del blog */}
          <Box sx={{ textAlign: 'center', mb: 5, mt: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 'bold',
                mb: 2,
                color: titleColor,
              }}
            >
              {BLOG_TITLE}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: '1.2rem',
                color: subtitleColor,
              }}
            >
              {BLOG_DESCRIPTION}
            </Typography>
          </Box>

          {/* Lista de posts en formato grid */}
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
                  backgroundColor: cardBackgroundColor,
                  boxShadow: 5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minHeight: '320px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                  },
                }}
              >
                {/* Imagen del post (opcional, si frontMatter.image) */}
                {post.frontMatter.image && (
                  <Box sx={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={post.frontMatter.image}
                      alt={post.frontMatter.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}

                {/* Contenido */}
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
                          color: titleColor,
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

          {/* Pie de página (opcional) */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              © {new Date().getFullYear()} Talberos. Proyecto Open Source - MIT
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// -----------------------------------------------------------------------------
// getStaticProps: lee ficheros .md y .mdx en la carpeta /blogs
// -----------------------------------------------------------------------------
/**
 * Lectura de los archivos markdown para listarlos en la homepage del blog.
 * @returns {Promise<{ props: { posts: Array<{ slug: string, frontMatter: any }> } }>}
 */
export async function getStaticProps() {
  const blogsDir = path.join(process.cwd(), 'blogs');
  let files = [];

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

  const posts = [];
  for (const file of markdownFiles) {
    const fullPath = path.join(blogsDir, file);
    try {
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(fileContent);

      posts.push({
        slug: file.replace(/\.(md|mdx)$/, ''), // Genera el slug sin extensión
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

  // Orden descendente por fecha
  posts.sort((a, b) => {
    const dateA = a.frontMatter.date ? new Date(a.frontMatter.date) : new Date();
    const dateB = b.frontMatter.date ? new Date(b.frontMatter.date) : new Date();
    return dateB - dateA;
  });

  return {
    props: { posts },
  };
}
