'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatMessage.js
 *
 * DESCRIPCIÓN:
 *   - Renderiza cada mensaje del chat con un estilo oscuro y compacto.
 *   - Usa ReactMarkdown para parsear texto (puede contener listas, títulos, etc.).
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Única responsabilidad: pintar el mensaje en pantalla.
 *   - OCP: Fácil de ajustar fondos, tamaños de fuente, etc. sin romper la lógica.
 * -----------------------------------------------------------------------------
 */

import React, { useEffect, useRef } from 'react';
import { Paper, List, ListItem, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { keyframes } from '@emotion/react';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE ESTILO
   -------------------------------------------------------------------------- */
const SLIDE_UP_ANIMATION = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ASSISTANT_BG = '#2F2F2F';
const USER_BG = '#3A3A3A';
const TEXT_COLOR = '#FFFFFF';

const MESSAGE_PADDING = 1.2;
const MESSAGE_FONT_SIZE = '0.88rem';
const LINE_HEIGHT = 1.3;

/* --------------------------------------------------------------------------
   2) COMPONENTE: ChatMessage
   -------------------------------------------------------------------------- */
export default function ChatMessage({ role, content }) {
  const containerRef = useRef(null);
  const isAssistant = role === 'assistant';

  // Reemplaza ***...*** con un bloque ctaBox
  const parsedContent = content.replace(
    /\*\*\*(.*?)\*\*\*/gs,
    (_, p1) => `<div class="ctaBox">${p1}</div>`
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.animation = `${SLIDE_UP_ANIMATION} 0.3s ease forwards`;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
        marginBottom: '0.4rem',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: MESSAGE_PADDING,
          maxWidth: '85%',
          borderRadius: isAssistant ? '10px 10px 10px 0' : '10px 10px 0 10px',
          backgroundColor: isAssistant ? ASSISTANT_BG : USER_BG,
          color: TEXT_COLOR,
          fontSize: MESSAGE_FONT_SIZE,
          lineHeight: LINE_HEIGHT,
        }}
      >
        <ReactMarkdown
          children={parsedContent}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownOverrides}
        />
      </Paper>
    </div>
  );
}

/* --------------------------------------------------------------------------
   3) OVERRIDES DE MARKDOWN => Mapeo a Componentes MUI
   -------------------------------------------------------------------------- */
const markdownOverrides = {
  div: ({ node, className, ...props }) => {
    // Bloque destacado con ***texto***
    if (className === 'ctaBox') {
      return (
        <div
          style={{
            border: '1px solid #666666',
            borderRadius: '6px',
            padding: '0.6rem',
            margin: '0.6rem 0',
            fontWeight: 'bold',
            backgroundColor: '#454545',
            color: '#FFFFFF',
          }}
          {...props}
        />
      );
    }
    return <div {...props} />;
  },
  h1: ({ node, ...props }) => (
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }} {...props} />
  ),
  h2: ({ node, ...props }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }} {...props} />
  ),
  h3: ({ node, ...props }) => (
    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }} {...props} />
  ),
  ul: ({ node, ...props }) => (
    <List sx={{ listStyleType: 'disc', pl: 3, mb: 0.5 }} {...props} />
  ),
  ol: ({ node, ...props }) => (
    <List sx={{ listStyleType: 'decimal', pl: 3, mb: 0.5 }} {...props} />
  ),
  li: ({ node, ...props }) => (
    <ListItem
      sx={{
        display: 'list-item',
        pl: 0,
        py: 0.2,
        alignItems: 'start',
      }}
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <Typography
      variant="body2"
      sx={{ mb: 0.5, fontSize: MESSAGE_FONT_SIZE, lineHeight: LINE_HEIGHT }}
      {...props}
    />
  ),
};
