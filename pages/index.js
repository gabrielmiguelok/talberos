"use client";

/**
 * MIT License
 * -----------
 * Archivo: /pages/index.js
 *
 * DESCRIPCIÓN:
 *   - Define la página principal (Landing Page) de la aplicación Talberos.
 *   - Muestra las distintas secciones que conforman la promoción de la librería Talberos.
 *   - Integra la barra de navegación, encabezado (Head) para SEO, secciones informativas
 *     y el chatbot flotante de WhatsApp.
 *
 * OBJETIVO:
 *   - Servir como principal punto de entrada a la plataforma, mostrando la propuesta de
 *     valor de Talberos y redirigiendo a secciones más específicas.
 *   - Cumplir con buenas prácticas de diseño y estructura siguiendo SOLID y modularidad.
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   1. Single Responsibility Principle (SRP):
 *      - Este componente se limita a organizar las secciones principales de la página.
 *        Cada sección (Hero, Metodología, Destacados, FAQ, etc.) tiene su propio componente.
 *   2. Open/Closed Principle (OCP):
 *      - El componente puede extenderse agregando nuevas secciones sin modificar el núcleo
 *        de la lógica ya existente.
 *   3. Liskov Substitution Principle (LSP):
 *      - No aplicable de forma directa aquí, pero mantenemos la intercambiabilidad de secciones
 *        (podrían sustituirse por otras si cumplen la misma interfaz).
 *   4. Interface Segregation Principle (ISP):
 *      - Cada sección maneja su propia interfaz interna (props) sin obligar a un uso excesivo
 *        de propiedades o funciones.
 *   5. Dependency Inversion Principle (DIP):
 *      - El componente IndexTalberos no depende de detalles internos de las secciones.
 *        Las secciones se inyectan como componentes independientes (inversión de control).
 *
 * LICENCIA:
 *   - Este código se ofrece con fines educativos bajo licencia MIT.
 */

import React from "react";
import Head from "next/head";
import Menu from "../components/landing/Menu";
import HeroTalberos from "../components/landing/HeroTalberos";
import MetodologiaSeccion from "../components/landing/MetodologiaSeccion";
import TalberosSection from "../components/landing/TalberosSection";
import UniqueDifferentiator from "../components/landing/UniqueDifferentiator";
import TalberosHighlights from "../components/landing/TalberosHighlights";
import FAQSectionTalberos from "../components/landing/FAQSectionTalberos";
import Footer from "../components/landing/Footer";

// IMPORTACIÓN DEL CHAT FLOTANTE
import { ChatWhatsAppFloat } from "../components/IconWhatsappFlotante";

/**
 * Componente de página principal que renderiza la Landing Page de Talberos.
 *
 * @function IndexTalberos
 * @returns {JSX.Element} JSX que conforma la pantalla de inicio de la aplicación.
 *
 * @example
 * // Ejemplo de uso:
 * export default function MyApp() {
 *   return <IndexTalberos />;
 * }
 */
export default function IndexTalberos() {
  return (
    <>
      {/**
       * Barra de navegación:
       * - 'isDarkMode' indica si el modo oscuro está activo (falso por defecto).
       * - 'onThemeToggle' es una función para alternar el tema (no implementada aquí).
       */}
      <Menu isDarkMode={false} onThemeToggle={() => {}} />

      {/**
       * Configuración de metadatos SEO:
       * - Título de la página
       * - Descripción
       * - Etiquetas Open Graph y Twitter Card
       */}
      <Head>
        <title>Talberos - Librería MIT para tablas estilo Excel en React</title>
        <meta
          name="description"
          content="La mejor librería open source para crear tablas estilo Excel en React, totalmente MIT. Filtrado, ordenamiento, edición en vivo, exportación a XLSX, etc."
        />
        <link rel="canonical" href="https://talberos.tech" />
        <meta property="og:title" content="Talberos - Página Inicial" />
        <meta
          property="og:description"
          content="Explora todo el potencial de Talberos: tablas estilo Excel, filtros avanzados y edición en vivo."
        />
        <meta property="og:url" content="https://talberos.tech" />
        <meta property="twitter:title" content="Talberos - Home" />
        <meta
          property="twitter:description"
          content="La mejor librería open source para crear tablas estilo Excel en React, ¡totalmente MIT!"
        />
      </Head>

      {/**
       * Secciones de la Landing Page:
       * - HeroTalberos: Sección principal que capta la atención del usuario.
       * - MetodologiaSeccion: Explica la metodología o el enfoque del proyecto.
       * - TalberosSection: Demuestra la librería en acción, con tablas en modo claro/oscuro.
       * - UniqueDifferentiator: Presenta características únicas de Talberos.
       * - TalberosHighlights: Resalta puntos clave o ventajas principales.
       * - FAQSectionTalberos: Preguntas frecuentes sobre la librería.
       */}
      <HeroTalberos />
      <MetodologiaSeccion />
      <TalberosSection />
      <UniqueDifferentiator />
      <TalberosHighlights />
      <FAQSectionTalberos />

      {/**
       * Footer:
       * - Contiene links relevantes y créditos.
       */}
      <Footer />

      {/**
       * Chat flotante de WhatsApp:
       * - Permite una acceso directo con los desarrolladores o soporte.
       */}
      <ChatWhatsAppFloat isEnglish={false} />
    </>
  );
}
