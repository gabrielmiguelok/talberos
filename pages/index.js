"use client";

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/index.js
 *
 * DESCRIPCIÓN:
 *   - Página principal (Landing Page) de Talberos.
 *   - Contiene las secciones centrales de promoción de la librería.
 *   - Incluye la barra de navegación, secciones informativas y el chat flotante
 *     de WhatsApp. Ahora se añade el nuevo chatbot de Talberos.
 *
 * OBJETIVO:
 *   - Servir como punto de entrada a la plataforma, mostrando la propuesta de
 *     valor de Talberos y dirigiendo a secciones específicas.
 *   - Integrar también el chatbot, con un ícono flotante para abrir su ventana.
 *
 * PRINCIPIOS SOLID APLICADOS:
 *   1. SRP: Este componente organiza las secciones principales de la Landing,
 *      delegando el contenido a subcomponentes (Hero, FAQ, etc.) y gestionando
 *      únicamente la apertura/cierre del chatbot.
 *   2. OCP: Podemos agregar más secciones o funcionalidades sin alterar la
 *      estructura base.
 *   3. LSP: Cada sección es autónoma; podemos intercambiarlas sin romper
 *      la coherencia de la página.
 *   4. ISP: Se evita exponer métodos innecesarios; cada parte recibe sólo las
 *      props que necesita.
 *   5. DIP: El index no depende de detalles internos de subcomponentes.
 *
 * LICENCIA:
 *   - Código ofrecido bajo licencia MIT.
 */

import React, { useState } from "react";

// Barra de navegación y secciones de la landing
import Menu from "../components/landing/Menu";
import HeroTalberos from "../components/landing/HeroTalberos";
import MetodologiaSeccion from "../components/landing/MetodologiaSeccion";
import TalberosSection from "../components/landing/TalberosSection";
import UniqueDifferentiator from "../components/landing/UniqueDifferentiator";
import TalberosHighlights from "../components/landing/TalberosHighlights";
import FAQSectionTalberos from "../components/landing/FAQSectionTalberos";
import Footer from "../components/landing/Footer";
import { ChatWhatsAppFloat } from "../components/IconWhatsappFlotante";

// NUEVO: Componentes del chatbot interno
import FloatingChatIcon from "../components/chatbot/FloatingChatIcon";
import ChatModal from "../components/chatbot/ChatModal";

/**
 * Componente de la Landing Page principal de Talberos.
 *
 * @function IndexTalberos
 * @param {boolean} [isDarkMode=false] - Indica si el modo oscuro está activo.
 * @param {Function} [onThemeToggle] - Función para alternar el tema (puede no usarse aquí).
 * @returns {JSX.Element} La estructura principal de la Landing Page.
 */
export default function IndexTalberos({ isDarkMode = false, onThemeToggle }) {
  // Estado para abrir/cerrar la ventana modal del chatbot
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Barra de navegación con modo claro/oscuro (si se desea utilizar). */}
      <Menu isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />

      {/* Contenedor principal semántico */}
      <main role="main">
        {/* Secciones de la Landing Page */}
        <HeroTalberos />
        <MetodologiaSeccion />
        <TalberosSection />
        <UniqueDifferentiator />
        <TalberosHighlights />
        <FAQSectionTalberos />

        {/* Footer con links relevantes y créditos */}
        <Footer />

        {/* Modal del chatbot (se muestra solo si chatOpen === true) */}
        {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
      </main>

      {/* Ícono flotante de WhatsApp */}
      <ChatWhatsAppFloat isEnglish={false} />

      {/* NUEVO: Ícono flotante para abrir ChatModal */}
      <FloatingChatIcon onClick={() => setChatOpen(true)} />
    </>
  );
}
