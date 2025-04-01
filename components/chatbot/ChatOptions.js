'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatOptions.js
 *
 * DESCRIPCIÓN:
 *   - Botones de opciones rápidas en el chat, con estilo oscuro y acento fucsia.
 *   - Cada opción dispara `onSelect(option)` para seguir el flujo conversacional.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Renderiza las opciones como botones; delega la lógica a ChatFlowManager.
 *   - OCP: Se pueden añadir más opciones sin romper la estructura.
 * -----------------------------------------------------------------------------
 */

import React from 'react';
import { Stack, Button } from '@mui/material';
import { keyframes } from '@emotion/react';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE ESTILO Y ANIMACIÓN
   -------------------------------------------------------------------------- */
const FADE_IN_UP = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ACCENT_FUCHSIA = '#FF00AA';
const ACCENT_FUCHSIA_HOVER = '#D5008E';

/* --------------------------------------------------------------------------
   2) COMPONENTE: ChatOptions
   -------------------------------------------------------------------------- */
export default function ChatOptions({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        mt: 1.5,
        animation: `${FADE_IN_UP} 0.3s ease-in-out`,
      }}
    >
      {options.map((option, idx) => (
        <Button
          key={idx}
          variant="contained"
          onClick={() => onSelect(option)}
          sx={{
            textTransform: 'none',
            fontSize: '0.82rem',
            fontWeight: 500,
            borderRadius: '16px',
            alignSelf: 'flex-start',
            backgroundColor: ACCENT_FUCHSIA,
            color: '#FFFFFF',
            transition: 'transform 0.1s ease-in-out',
            padding: '4px 14px',
            '&:hover': {
              backgroundColor: ACCENT_FUCHSIA_HOVER,
              transform: 'scale(1.02)',
            },
          }}
        >
          {option}
        </Button>
      ))}
    </Stack>
  );
}
