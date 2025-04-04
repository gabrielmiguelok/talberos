/**
 * Archivo: /components/CustomTable/hooks/useThemeMode.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 *   Hook sencillo para manejar tema oscuro o claro en un componente:
 *    - Guarda el modo actual ('light' o 'dark') en un estado.
 *    - Provee función para alternar (toggle) el tema.
 *
 *   Este hook no depende de la tabla, puede reutilizarse en cualquier parte.
 *
 * @version 1.0
 */

import { useState } from 'react';

export function useThemeMode(initialMode = 'light') {
  const [themeMode, setThemeMode] = useState(initialMode);

  // Alternar entre light/dark
  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Determina si estamos en modo oscuro
  const isDarkMode = themeMode === 'dark';

  return {
    themeMode,
    isDarkMode,
    toggleThemeMode,
  };
}
