"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/index.js
 *
 * DESCRIPCIÓN:
 *   - Landing Page principal de Talberos, con modo oscuro opcional y
 *     múltiples formatos de imagen para maximizar la compatibilidad
 *     en previsualizaciones.
 *
 * OBJETIVO:
 *   - Servir como puerta de entrada a la plataforma Talberos.
 *   - Cuidar el SEO y la compatibilidad con diferentes lectores y redes sociales.
 */

import React, { useState } from 'react';
import Head from 'next/head';

// Secciones principales de la Landing
import Menu from '../components/landing/Menu';
import HeroTalberos from '../components/landing/HeroTalberos';
import MetodologiaSeccion from '../components/landing/MetodologiaSeccion';
import TalberosSection from '../components/landing/TalberosSection';
import UniqueDifferentiator from '../components/landing/UniqueDifferentiator';
import TalberosHighlights from '../components/landing/TalberosHighlights';
import FAQSectionTalberos from '../components/landing/FAQSectionTalberos';
import Footer from '../components/landing/Footer';

// Botón flotante de WhatsApp
import { ChatWhatsAppFloat } from '../components/IconWhatsappFlotante';

// Chatbot interno
import FloatingChatIcon from '../components/chatbot/FloatingChatIcon';
import ChatModal from '../components/chatbot/ChatModal';

export default function IndexTalberos({ isDarkMode = false, onThemeToggle }) {
  const [chatOpen, setChatOpen] = useState(false);

  /**
   * Metadatos SEO de la Landing Page, con múltiples formatos de imagen (webp, png, jpg).
   */
  const PAGE_TITLE = 'Talberos - Framework Open Source en React y Next.js';
  const PAGE_DESCRIPTION =
    'Talberos es un framework 100% libre y escalable para crear tablas Excel-like, paneles (tableros) y soluciones en React y Next.js con autenticación Google OAuth.';
  const PAGE_KEYWORDS =
    'Talberos, tableros, Excel-like, React, Next.js, open-source, framework, MIT';

  // URL base (ajusta si usas otro dominio real)
  const BASE_URL = 'https://talberos.tech';

  // Rutas de imágenes (ajusta si difieren)
  const IMAGE_WEBP = `${BASE_URL}/images/preview.webp`;
  const IMAGE_PNG = `${BASE_URL}/images/preview.png`;
  const IMAGE_JPG = `${BASE_URL}/images/preview.jpg`;

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />

        {/* Palabras clave y robots */}
        <meta name="keywords" content={PAGE_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Gabriel Hércules Miguel" />

        {/* Favicons (ajusta rutas si cambian) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={BASE_URL} />
        <meta property="og:image" content={IMAGE_WEBP} />
        <meta property="og:image" content={IMAGE_PNG} />
        <meta property="og:image" content={IMAGE_JPG} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:url" content={BASE_URL} />
        <meta name="twitter:image" content={IMAGE_WEBP} />
        <meta name="twitter:image" content={IMAGE_PNG} />
        <meta name="twitter:image" content={IMAGE_JPG} />

        {/* URL canónica */}
        <link rel="canonical" href={BASE_URL} />

        {/* Datos Estructurados (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Talberos',
              url: BASE_URL,
              description: PAGE_DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_URL}/?s={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        <meta name="theme-color" content="#1F1F1F" />
      </Head>

      {/* Barra de navegación (modo oscuro opcional) */}
      <Menu isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />

      <main role="main" id="main-content">
        <HeroTalberos />
        <MetodologiaSeccion />
        <TalberosSection />
        <UniqueDifferentiator />
        <TalberosHighlights />
        <FAQSectionTalberos />
        <Footer />

        {/* Modal del chatbot (se muestra si chatOpen === true) */}
        {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
      </main>

      {/* Ícono flotante de WhatsApp (draggable) */}
      <ChatWhatsAppFloat isEnglish={false} />

      {/* Ícono flotante para abrir el chatbot interno (no arrastrable) */}
      <FloatingChatIcon onClick={() => setChatOpen(true)} />
    </>
  );
}
