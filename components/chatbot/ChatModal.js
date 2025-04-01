'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/ChatModal.js
 *
 * DESCRIPCIÓN:
 *   - Ventana modal del chatbot para Talberos (Chalberos), con estilo oscuro y detalles en fucsia.
 *   - Incluye:
 *       * AppBar oscuro para el encabezado.
 *       * Área de mensajes compactos y con alto contraste.
 *       * TextField y botón fucsia para enviar.
 *   - Al cerrarse, emite un evento global para hacer reaparecer el ícono flotante.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Controla la interfaz visual del chat, su ciclo de vida (apertura/cierre)
 *          y despacha un evento para indicar que se cerró.
 *   - DIP: Se apoya en ChatFlowManager para la lógica de estados,
 *          sin acoplarse a implementaciones concretas del ícono flotante.
 * -----------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  TextField,
  Box,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Image from 'next/image';

import { ChatSteps } from './ChatSteps';
import { ChatFlowManager } from './ChatFlowManager';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE ESTILO
   -------------------------------------------------------------------------- */
// Nuevo esquema oscuro + acentos en fucsia:
const MODAL_BG = '#1F1F1F'; // Fondo base del modal
const HEADER_BG_GRADIENT = 'linear-gradient(135deg, #1F1F1F 30%, #2A2A2A 100%)';
const HEADER_TEXT_COLOR = '#FFFFFF';
const MESSAGES_AREA_BG = '#252525'; // Fondo donde van los mensajes
const BORDER_COLOR = '#3A3A3A';
const PLACEHOLDER_COLOR = '#888888';
const ACCENT_FUCHSIA = '#FF00AA';
const ACCENT_FUCHSIA_HOVER = '#D5008E'; // Un fucsia más oscuro al hover

// Ajustes de tamaño
const CHAT_WIDTH = { xs: '100%', sm: 380 };
const CHAT_HEIGHT = { xs: '80vh', sm: '65vh' };
const BORDER_RADIUS = 12;
const MESSAGE_AREA_PADDING = 1; // Espacio interno en rem

// Tamaños de fuente y espacios para compactar más
const FONT_SIZE_TEXTFIELD = '0.85rem';

/* --------------------------------------------------------------------------
   2) COMPONENTE PRINCIPAL: ChatModal
   -------------------------------------------------------------------------- */
export default function ChatModal({ onClose }) {
  const [conversation, setConversation] = useState([]);
  const [currentState, setCurrentState] = useState('MAIN');
  const [options, setOptions] = useState([]);
  const [userInput, setUserInput] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const main = ChatSteps.MAIN;
    const initMsgs = main.assistantMessages.map((m) => ({
      role: 'assistant',
      content: m,
    }));
    setConversation(initMsgs);
    setOptions(main.options);
  }, []);

  useEffect(() => {
    // Auto-scroll al final cuando cambian los mensajes u opciones
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversation, options]);

  // Envía el mensaje que el usuario teclea
  const handleSendMessage = () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;

    setConversation((prev) => [...prev, { role: 'user', content: trimmed }]);
    setUserInput('');

    const { newState, assistantMessages, newOptions } = ChatFlowManager(currentState, trimmed);
    setCurrentState(newState);
    setOptions(newOptions || []);

    const newAssistantMsgs = assistantMessages.map((m) => ({
      role: 'assistant',
      content: m,
    }));
    setConversation((prev) => [...prev, ...newAssistantMsgs]);
  };

  // Selección de una opción de ChatOptions
  const handleOptionSelect = (optionText) => {
    const { newState, assistantMessages, newOptions } = ChatFlowManager(currentState, optionText);
    setCurrentState(newState);
    setOptions(newOptions || []);

    const newAssistantMsgs = assistantMessages.map((m) => ({
      role: 'assistant',
      content: m,
    }));
    setConversation((prev) => [...prev, ...newAssistantMsgs]);
  };

  // Enviar con Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Definir si se ve el TextField (cuando no hay opciones y no es estado FINAL)
  const shouldShowTextField = () => {
    const step = ChatSteps[currentState];
    if (!step?.options) return true;
    if (step.options.length > 0) return false;
    return true;
  };

  /**
   * Dispara evento global para que el ícono flotante se muestre de nuevo.
   * Llamamos onClose() para que el padre o quien use este modal lo cierre.
   */
  const handleCloseModal = () => {
    onClose?.();
    window.dispatchEvent(new Event('show-floating-icon'));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: CHAT_WIDTH,
        height: CHAT_HEIGHT,
        maxHeight: '90vh',
        backgroundColor: MODAL_BG,
        boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Encabezado oscuro */}
      <AppBar
        position="static"
        sx={{
          borderTopLeftRadius: BORDER_RADIUS,
          borderTopRightRadius: BORDER_RADIUS,
          background: HEADER_BG_GRADIENT,
          color: HEADER_TEXT_COLOR,
          boxShadow: 'none',
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 46, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {/* Ícono (PNG) con fondo #1F1F1F */}
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src="/chat.png"
                alt="Talberos Chat Icon"
                width={28}
                height={28}
              />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              Chalberos Open Source !
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} sx={{ color: HEADER_TEXT_COLOR }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Zona de mensajes */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: MESSAGE_AREA_PADDING,
          backgroundColor: MESSAGES_AREA_BG,
        }}
      >
        {conversation.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {options.length > 0 && (
          <ChatOptions
            options={options}
            onSelect={handleOptionSelect}
          />
        )}
        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
      </Box>

      {/* Campo de texto (si no hay opciones y no es estado FINAL) */}
      {currentState !== 'FINAL' && shouldShowTextField() && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderTop: `1px solid ${BORDER_COLOR}`,
            p: 1,
            backgroundColor: MODAL_BG,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            sx={{
              fontSize: FONT_SIZE_TEXTFIELD,
              backgroundColor: '#2A2A2A',
              color: '#ffffff',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: BORDER_COLOR,
                },
                '&:hover fieldset': {
                  borderColor: ACCENT_FUCHSIA,
                },
                '&.Mui-focused fieldset': {
                  borderColor: ACCENT_FUCHSIA,
                },
              },
              '& input': {
                color: '#ffffff',
                fontSize: FONT_SIZE_TEXTFIELD,
                '::placeholder': {
                  color: PLACEHOLDER_COLOR,
                },
              },
              mr: 1,
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            sx={{
              backgroundColor: ACCENT_FUCHSIA,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: ACCENT_FUCHSIA_HOVER,
              },
              borderRadius: 2,
              p: '6px',
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}

      {/* Botón de reinicio si estado FINAL */}
      {currentState === 'FINAL' && (
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <IconButton
            onClick={() => handleOptionSelect('Empezar de nuevo')}
            sx={{
              backgroundColor: ACCENT_FUCHSIA,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: ACCENT_FUCHSIA_HOVER,
              },
              borderRadius: 2,
            }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
