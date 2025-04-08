/************************************************************************************
 * Archivo: /components/CustomTable/hooks/useThemeMode.js
 * LICENSE: MIT
 *
 * DESCRIPCIÓN:
 * ----------------------------------------------------------------------------------
 *   Hook sencillo para manejar el tema oscuro/claro en un componente:
 *    - Almacena el modo actual ('light' o 'dark').
 *    - Provee una función para alternar el tema (toggle).
 *    - Expone también un booleano "isDarkMode" para condiciones de renderizado.
 *
 * Principios SOLID:
 * ----------------------------------------------------------------------------------
 *   - SRP: Una única responsabilidad -> Manejo del modo de tema.
 *   - DIP: No depende de la implementación de la tabla, puede usarse en cualquier parte.
 *
 * @version 1.0
 ************************************************************************************/

import { useState } from 'react';

/**
 * useThemeMode
 * ----------------------------------------------------------------------------------
 * Maneja el estado de "tema" (claro u oscuro) y provee un método para cambiarlo.
 *
 * @param {string} initialMode - 'light' o 'dark' (por defecto 'light').
 * @returns {Object} { themeMode, isDarkMode, toggleThemeMode }
 */
export function useThemeMode(initialMode = 'light') {
  const [themeMode, setThemeMode] = useState(initialMode);

  /**
   * toggleThemeMode
   * ----------------------------------------------------------------------------------
   * Invierte el modo actual: si está en 'dark', pasa a 'light'; o viceversa.
   */
  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  /**
   * isDarkMode
   * ----------------------------------------------------------------------------------
   * Indica rápidamente si estamos en modo 'dark' para condicionar estilos.
   */
  const isDarkMode = themeMode === 'dark';

  return {
    themeMode,
    isDarkMode,
    toggleThemeMode,
  };
}
