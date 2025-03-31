/************************************************************************************************
 * FILE: ./pages/blog/create.js
 * LICENSE: MIT
 *
 * DESCRIPTION:
 *  - Página "Crear Artículo" para el Blog de Talberos, similar en estilo al index
 *    que lista artículos, **pero** sin importar ni usar BackgroundShapes.
 *  - Ofrece un formulario básico para ingresar datos de un artículo: título, descripción,
 *    fecha y contenido. En un proyecto real, estos datos se enviarían a un backend
 *    (endpoint o base de datos) para ser guardados.
 *  - Paleta de colores y estilos coherentes con el resto de Talberos.
 *
 * PRINCIPIOS SOLID y CLEAN CODE:
 *  - SRP (Single Responsibility Principle): La página se centra en la creación de
 *    un post, sin mezclar lógica de listado ni de vista detallada.
 *  - OCP (Open/Closed Principle): Se pueden añadir nuevos campos sin alterar la
 *    estructura esencial (por ejemplo, tags, categoría, etc.).
 *  - LSP (Liskov Substitution Principle): Podríamos reemplazar la lógica de guardado
 *    local por un fetch a una API real sin afectar la interfaz del componente.
 *  - ISP (Interface Segregation Principle): Sólo tenemos las props necesarias (aquí,
 *    casi ninguna – la funcionalidad está auto-contenida).
 *  - DIP (Dependency Inversion Principle): El 'almacenamiento' no está acoplado a un
 *    servicio específico. Usamos un handleFakeSave que simula persistencia.
 *
 * AUTODOCUMENTACIÓN:
 *  - Cada parte del código está claramente comentada.
 *  - Se mantiene una línea clara: el objetivo es "Crear un post" con la misma estética
 *    que el index del blog, sin fondos animados y con dark mode por defecto.
 ************************************************************************************************/

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Box, Typography, TextField, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';

// Importamos el Menu en modo dinámico (ssr: false) por usar 'use client'
const Menu = dynamic(() => import('@components/landing/Menu'), { ssr: false });

// ----------------------------------------------------------------
// Constantes SEO + Texto
// ----------------------------------------------------------------
const BLOG_CREATE_TITLE = 'Crear Nuevo Artículo - Blog de Talberos';
const BLOG_CREATE_DESCRIPTION =
  'Página para crear artículos en el blog de Talberos (librería MIT para tablas estilo Excel).';
const BLOG_OG_IMAGE = '/imagenes/talberos-blog-og.jpg'; // Actualiza si deseas
const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ----------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------
/**
 * CreateBlogPage
 * Página que muestra un formulario para crear un nuevo artículo en el blog.
 * @returns {JSX.Element}
 */
export default function CreateBlogPage() {
  // Hook de tema y tamaño de pantalla
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado interno para modo oscuro (por si deseas personalizarlo)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
    }
  }, []);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');

  // Paleta de colores y estilos (coherentes con tu blog index)
  const containerBackgroundColor = '#121212'; // Fondo oscuro principal
  const cardBackgroundColor = '#1F1F1F';      // Fondo de tarjetas
  const titleColor = '#FF00AA';              // Color principal (rosa)
  const textColor = '#FFFFFF';               // Texto blanco
  const labelColor = '#ccc';                 // Color para labels de TextField

  // URL canónica de esta sección (puedes cambiarlo si es un subpath distinto)
  const pageUrl = `${BLOG_BASE_URL}/blog/create`;

  // Metadatos para SEO (Open Graph, Twitter, JSON-LD)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: BLOG_CREATE_TITLE,
    description: BLOG_CREATE_DESCRIPTION,
    url: pageUrl,
  };

  // Handler para simular guardado local de un post
  const handleCreatePost = (e) => {
    e.preventDefault();
    // Aquí enviarías datos a tu backend real.
    const newPost = {
      title,
      description,
      date: date || new Date().toISOString(),
      content,
    };
    console.log('Nuevo artículo simulado:', newPost);
    alert('Artículo creado en modo DEMO (ver consola).');

    // Limpieza de campos
    setTitle('');
    setDescription('');
    setDate('');
    setContent('');
  };

  return (
    <>
      <Head>
        <title>{BLOG_CREATE_TITLE}</title>
        <meta name="description" content={BLOG_CREATE_DESCRIPTION} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={BLOG_CREATE_TITLE} />
        <meta property="og:description" content={BLOG_CREATE_DESCRIPTION} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={BLOG_OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BLOG_CREATE_TITLE} />
        <meta name="twitter:description" content={BLOG_CREATE_DESCRIPTION} />
        <meta name="twitter:image" content={BLOG_OG_IMAGE} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>

      {/* Menu (Navbar) en modo dark */}
      <Menu />

      {/* Contenedor principal */}
      <Box
        sx={{
          backgroundColor: containerBackgroundColor,
          position: 'relative',
          minHeight: '100vh',
          pt: isMobile ? 10 : 12,
          pb: 4,
          px: isMobile ? 2 : 3,
          color: textColor,
        }}
      >
        {/* Contenedor para el formulario */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 800,
            margin: '0 auto',
            backgroundColor: cardBackgroundColor,
            boxShadow: 5,
            borderRadius: 2,
            overflow: 'hidden',
            p: isMobile ? 2 : 4,
          }}
        >
          {/* Título principal */}
          <Typography
            variant="h1"
            sx={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: 'bold',
              mb: 2,
              color: titleColor,
            }}
          >
            Crear Nuevo Artículo
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#ccc' }}>
            Aquí puedes redactar y simular la creación de un artículo para el blog de Talberos.
          </Typography>

          {/* Formulario */}
          <form onSubmit={handleCreatePost}>
            {/* Campo Título */}
            <TextField
              label="Título"
              required
              variant="filled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: '#2C2C2C',
                label: { color: labelColor },
                input: { color: textColor },
              }}
            />

            {/* Campo Descripción */}
            <TextField
              label="Descripción"
              required
              variant="filled"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: '#2C2C2C',
                label: { color: labelColor },
                input: { color: textColor },
              }}
            />

            {/* Campo Fecha */}
            <TextField
              label="Fecha (opcional, YYYY-MM-DD)"
              variant="filled"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: '#2C2C2C',
                label: { color: labelColor },
                input: { color: textColor },
              }}
            />

            {/* Campo Contenido */}
            <TextField
              label="Contenido del Artículo"
              required
              variant="filled"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={6}
              fullWidth
              sx={{
                mb: 3,
                backgroundColor: '#2C2C2C',
                label: { color: labelColor },
                textarea: { color: textColor },
              }}
            />

            {/* Botón "Crear" */}
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: titleColor,
                color: '#FFF',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: '#E60099',
                },
              }}
            >
              Crear Artículo
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}
