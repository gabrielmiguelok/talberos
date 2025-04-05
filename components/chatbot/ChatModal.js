/****************************************************************************************
 * File: ChatModal.jsx
 * --------------------------------------------------------------------------------------
 * Componente principal del Chat.
 *
 * - Carga el estado inicial ("MAIN") y muestra mensajes (ChatMessage) y opciones (ChatOptions).
 * - Se apoya en ChatFlowManager para cambiar estados según el input del usuario.
 * - Importa todos los estilos desde un único archivo central: ChatStylesConfig.js.
 ****************************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Image from 'next/image';

/* Importa las constantes de estilo desde ChatStylesConfig.js */
import { CHAT_MODAL_STYLES } from './ChatStylesConfig';

/* Importa ChatSteps y ChatFlowManager para la lógica del chat */
import { ChatSteps } from './steps';
import { ChatFlowManager } from './ChatFlowManager';

import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';

export default function ChatModal({ onClose }) {
  const [conversation, setConversation] = useState([]);
  const [currentState, setCurrentState] = useState('MAIN');
  const [options, setOptions] = useState([]);
  const [userInput, setUserInput] = useState('');

  // Referencia para el scroll automático al final de los mensajes
  const messagesEndRef = useRef(null);

  // Al montar, carga el estado MAIN y los mensajes iniciales
  useEffect(() => {
    const mainStep = ChatSteps.MAIN;
    const initialMsgs = mainStep.assistantMessages.map((m) => ({
      role: 'assistant',
      content: m,
    }));
    setConversation(initialMsgs);
    setOptions(mainStep.options || []);
  }, []);

  // Auto-scroll al final de la conversación
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversation, options]);

  // Envía el mensaje del usuario
  const handleSendMessage = () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;

    // Añade el mensaje del usuario
    setConversation((prev) => [...prev, { role: 'user', content: trimmed }]);
    setUserInput('');

    // Obtiene el nuevo estado y mensajes del asistente
    const { newState, assistantMessages, newOptions } = ChatFlowManager(currentState, trimmed);
    setCurrentState(newState);
    setOptions(newOptions || []);

    // Agrega los mensajes del asistente
    const newAssistantMsgs = assistantMessages.map((msg) => ({
      role: 'assistant',
      content: msg,
    }));
    setConversation((prev) => [...prev, ...newAssistantMsgs]);
  };

  // Maneja la selección de una opción
  const handleOptionSelect = (optionText) => {
    setConversation((prev) => [...prev, { role: 'user', content: optionText }]);

    const { newState, assistantMessages, newOptions } = ChatFlowManager(currentState, optionText);
    setCurrentState(newState);
    setOptions(newOptions || []);

    const newAssistantMsgs = assistantMessages.map((msg) => ({
      role: 'assistant',
      content: msg,
    }));
    setConversation((prev) => [...prev, ...newAssistantMsgs]);
  };

  // Envía mensaje al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Muestra el TextField, excepto en estado "FINAL"
  const shouldShowTextField = () => {
    if (currentState === 'FINAL') return false;
    const stepData = ChatSteps[currentState];
    if (!stepData || !stepData.options) return true;
    return stepData.options.length === 0;
  };

  return (
    <Box sx={CHAT_MODAL_STYLES.container}>
      <AppBar position="static" sx={CHAT_MODAL_STYLES.appBar}>
        <Toolbar variant="dense" sx={CHAT_MODAL_STYLES.toolBar}>
          <Box sx={CHAT_MODAL_STYLES.brandBox}>
            <Box sx={CHAT_MODAL_STYLES.brandImageContainer}>
              {/* Cambia /logo.png por la ruta de tu logo */}
              <Image src="/logo.png" alt="Talberos Logo" width={28} height={28} />
            </Box>
            <Typography variant="subtitle1" sx={CHAT_MODAL_STYLES.brandTitle}>
              Talberos LIBRE
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={CHAT_MODAL_STYLES.closeButton}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={CHAT_MODAL_STYLES.messageListContainer}>
        {conversation.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}

        {options.length > 0 && (
          <ChatOptions options={options} onSelect={handleOptionSelect} />
        )}

        {/* Elemento para mantener el scroll siempre abajo */}
        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
      </Box>

      {shouldShowTextField() && (
        <Box sx={CHAT_MODAL_STYLES.textFieldContainer}>
          <TextField
            variant="outlined"
            placeholder="Escribe tu mensaje..."
            size="small"
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={CHAT_MODAL_STYLES.textField}
          />
          <IconButton onClick={handleSendMessage} sx={CHAT_MODAL_STYLES.sendButton}>
            <SendRoundedIcon />
          </IconButton>
        </Box>
      )}

      {currentState === 'FINAL' && (
        <Box sx={CHAT_MODAL_STYLES.finalContainer}>
          <IconButton
            onClick={() => handleOptionSelect('Empezar de nuevo')}
            sx={CHAT_MODAL_STYLES.finalButton}
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
