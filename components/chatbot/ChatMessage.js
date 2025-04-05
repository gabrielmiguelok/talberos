/****************************************************************************************
 * File: ChatMessage.jsx
 * --------------------------------------------------------------------------------------
 * - Renderiza cada mensaje (del usuario o del asistente).
 * - Soporta Markdown y reemplaza ***texto*** con una caja destacada (CTA).
 * - Importa los estilos desde ChatStylesConfig.
 ****************************************************************************************/
import React, { useEffect, useRef } from 'react';
import { Paper, List, ListItem, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { CHAT_MESSAGE_STYLES } from './ChatStylesConfig';

export default function ChatMessage({ role, content }) {
  const isAssistant = role === 'assistant';

  // Reemplaza ***...*** por una <div class="ctaBox"> para resaltarlo
  const parsedContent = content.replace(
    /\*\*\*(.*?)\*\*\*/gs,
    (_, p1) => `<div class="ctaBox">${p1}</div>`
  );

  // Ref para disparar la animación "slideUp" al montar
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.animation = `${CHAT_MESSAGE_STYLES.slideUpAnimation} 0.3s ease forwards`;
    }
  }, []);

  // Configuración de Markdown para renderizar elementos con MUI
  const mdComponents = {
    // Renderizado personalizado de la "ctaBox"
    div: ({ node, className, ...props }) => {
      if (className === 'ctaBox') {
        return <div style={CHAT_MESSAGE_STYLES.ctaBox} {...props} />;
      }
      return <div {...props} />;
    },
    h1: ({ node, ...props }) => (
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }} {...props} />
    ),
    ul: ({ node, ...props }) => (
      <List sx={{ listStyleType: 'disc', pl: 3, mb: 1 }} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <List sx={{ listStyleType: 'decimal', pl: 3, mb: 1 }} {...props} />
    ),
    li: ({ node, ...props }) => (
      <ListItem
        sx={{ display: 'list-item', pl: 0, py: 0.3, alignItems: 'start' }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <Typography
        variant="body2"
        sx={{ mb: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}
        {...props}
      />
    ),
  };

  return (
    <div
      ref={containerRef}
      style={CHAT_MESSAGE_STYLES.messageContainer(isAssistant)}
    >
      <Paper elevation={2} sx={CHAT_MESSAGE_STYLES.messagePaper(isAssistant)}>
        <ReactMarkdown
          children={parsedContent}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={mdComponents}
        />
      </Paper>
    </div>
  );
}
