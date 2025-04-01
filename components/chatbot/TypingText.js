'use client';

/**
 * MIT License
 * -----------------------------------------------------------------------------
 * Archivo: /components/chatbot/TypingText.js
 *
 * DESCRIPCIÓN:
 *   - Muestra un texto de forma "tipeada" caracter por caracter, con un retardo
 *     fijo entre cada carácter para simular escritura humana.
 *   - Puede emplearse en lugar de ChatMessage para introducir mensajes con
 *     animación de tipeo.
 *
 * PRINCIPIOS SOLID:
 *   - SRP: Maneja exclusivamente la lógica de "typewriter".
 *   - DIP: No depende de la lógica de chat ni de la interfaz concreta.
 *
 * -----------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';

/* --------------------------------------------------------------------------
   1) CONSTANTES DE CONFIGURACIÓN
   -------------------------------------------------------------------------- */
const DEFAULT_TYPING_SPEED = 20; // ms

/* --------------------------------------------------------------------------
   2) COMPONENTE: TypingText
   -------------------------------------------------------------------------- */
export default function TypingText({ text, typingSpeed = DEFAULT_TYPING_SPEED, onDone }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        if (onDone) onDone();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, typingSpeed, onDone]);

  return <>{displayedText}</>;
}
