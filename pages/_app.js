/**
 * MIT License
 *
 * Punto de entrada principal de la aplicación.
 * Se encarga de:
 *   - Aplicar estilos globales
 *   - Manejar el modo claro/oscuro
 *   - Asegurar reproducción exclusiva de videos
 *   - Renderizar la página actual
 *
 * @module pages/_app
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/globals.css';

/**
 * Hook personalizado para gestionar el modo claro/oscuro.
 *
 * @returns {[boolean, Function]} [isDarkMode, toggleTheme]
 */
function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const className = 'dark-mode';
    if (isDarkMode) {
      document.documentElement.classList.add(className);
    } else {
      document.documentElement.classList.remove(className);
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return [isDarkMode, toggleTheme];
}

/**
 * Hook que asegura que solo se reproduzca un video a la vez.
 */
function useSingleVideoPlayback() {
  useEffect(() => {
    const handlePlay = (event) => {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video) => {
        if (video !== event.target) video.pause();
      });
    };

    const videos = document.querySelectorAll('video');
    videos.forEach((video) => video.addEventListener('play', handlePlay));

    return () => {
      videos.forEach((video) => video.removeEventListener('play', handlePlay));
    };
  }, []);
}

/**
 * Componente principal MyApp.
 *
 * @param {object} props - Props proporcionadas por Next.js.
 * @param {React.Component} props.Component - Componente de la página actual.
 * @param {object} props.pageProps - Props específicas de la página actual.
 * @returns {JSX.Element} Renderizado principal de la aplicación.
 */
export default function MyApp({ Component, pageProps }) {
  const [isDarkMode, toggleTheme] = useTheme();
  useSingleVideoPlayback();

  return (
    <>
      {/* Renderizado de la página actual, con props de tema */}
      <Component {...pageProps} isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
    </>
  );
}
