'use client';

/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/Menu.js
 *
 * DESCRIPCIÓN:
 *  - Menú de navegación flotante para Talberos (estilo "dock" que puede desacoplarse).
 *  - Incluye:
 *     1) Botón principal que redirige al repositorio open source de Talberos.
 *     2) Botón de autenticación (inicia/cierra sesión).
 *     3) Botón de "Blog" que lleva a la ruta /blog.
 *
 * PRINCIPIOS SOLID:
 *  - SRP (Single Responsibility Principle): este componente se encarga únicamente
 *    de la navegación y autenticación.
 *  - OCP (Open/Closed Principle): se puede extender añadiendo más ítems sin modificar
 *    la estructura base.
 *  - LSP (Liskov Substitution Principle): funciones internas se pueden sustituir o
 *    reimplementar sin alterar el comportamiento general.
 *  - ISP (Interface Segregation Principle): las props son mínimas y específicas.
 *  - DIP (Dependency Inversion Principle): se abstraen detalles como rutas de logout,
 *    presuponiendo endpoints que podrían cambiar.
 *
 * AUTODOCUMENTACIÓN:
 *  - Cada función interna describe su responsabilidad.
 *  - Código alineado con buenas prácticas de Clean Code (nomenclatura clara, comentarios
 *    donde realmente aporta valor, estructuras lógicas concisas).
 *
 * @version 1.1
 * ----------------------------------------------------------------------------
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useRouter } from 'next/router';

// Íconos para la barra de navegación
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

/**
 * Componente principal de Menú de navegación.
 * @param {Object} props
 * @param {boolean} [props.isDarkMode=true] - Indica si se utilizará una paleta oscura (por si se decide).
 * @param {number} [props.navHeight=60] - Altura del AppBar.
 * @param {number} [props.dockThreshold=40] - Distancia en px para "acoplar" el menú arriba al soltar el arrastre.
 * @returns JSX.Element
 */
export default function Menu({
  isDarkMode = true,
  navHeight = 60,
  dockThreshold = 40,
}) {
  // -------------------------------------------------------------------------
  // [A] ESTADO Y REFERENCIAS
  // -------------------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isDocked, setIsDocked] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dockRef = useRef(null); // Referencia para el AppBar "acoplado"

  // Posición y dimensiones del menú cuando se desacopla
  const [floatStyle, setFloatStyle] = useState({
    top: 0,
    left: 0,
    width: '100%',
    height: navHeight,
  });

  // React Spring para animar el arrastre
  const [springStyle, api] = useSpring(() => ({ x: 0, y: 0 }));

  // Hooks para responsive y routing
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  // -------------------------------------------------------------------------
  // [B] CONSTANTES DE COLOR Y ESTILO
  // -------------------------------------------------------------------------
  // Alineado con la paleta usada en Talberos (fondos oscuros + acento magenta)
  const NAVBAR_BACKGROUND = 'linear-gradient(135deg, #FF00AA 50%, #1F1F1F 80%)';
  const NAVBAR_TEXT_COLOR = '#1F1F1F';
  const NAVBAR_BUTTON_BG = '#FF00AA';
  const NAVBAR_HOVER_BG = '#FF00AA';
  const NAVBAR_ELEVATION = '0px 2px 8px rgba(0, 0, 0, 0.7)';

  // -------------------------------------------------------------------------
  // [C] EFECTO: VERIFICAR AUTENTICACIÓN
  // -------------------------------------------------------------------------
  /**
   * checkAuth
   * Llama al endpoint /api/auth/verify para determinar si el usuario está logueado.
   * Asume que en caso de error o no autenticado, se retorna un JSON con { error, userEmail: null }.
   */
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        if (!data.error && data.userEmail) {
          setIsAuthenticated(true);
          setUserEmail(data.userEmail);
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    }
    checkAuth();
  }, []);

  // -------------------------------------------------------------------------
  // [D] LÓGICA DE ARRASTRE
  // -------------------------------------------------------------------------
  /**
   * hook useDrag
   * Permite que el menú se "desacople" y se arrastre libremente en la pantalla.
   * Cuando first === true y isDocked === true, se mide la posición para transicionar.
   * Cuando se suelta (last === true), si la posición top es menor que dockThreshold,
   * se vuelve a acoplar isDocked = true.
   */
  const bind = useDrag(
    ({ offset: [ox, oy], first, last }) => {
      if (first && isDocked) {
        const rect = dockRef.current?.getBoundingClientRect();
        if (rect) {
          const absoluteTop = rect.top + window.scrollY;
          const absoluteLeft = rect.left + window.scrollX;
          setFloatStyle({
            top: absoluteTop,
            left: absoluteLeft,
            width: `${rect.width}px`,
            height: rect.height,
          });
          api.start({ x: 0, y: 0 });
          setIsDocked(false);
        }
      }

      if (!isDocked) {
        // Actualiza la posición mientras se arrastra
        api.start({ x: ox, y: oy });
        if (last) {
          // Al soltar, vemos si se reconecta arriba
          const finalTop = floatStyle.top + oy;
          if (finalTop < dockThreshold) {
            setIsDocked(true);
            api.set({ x: 0, y: 0 });
          }
        }
      }
    },
    { filterTaps: false }
  );

  // -------------------------------------------------------------------------
  // [E] HANDLERS DE AUTENTICACIÓN
  // -------------------------------------------------------------------------
  /**
   * handleLogin
   * Redirige a /api/auth/google para iniciar sesión con Google.
   */
  const handleLogin = () => {
    router.push('/api/auth/google');
  };

  /**
   * handleLogout
   * Llama a /api/auth/logout (POST), y si es exitoso, regresa la app al home '/'.
   */
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setIsAuthenticated(false);
        setUserEmail(null);
        router.push('/');
      } else {
        console.error('Error al cerrar sesión:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // -------------------------------------------------------------------------
  // [F] SUBCOMPONENTES DE BOTONES
  // -------------------------------------------------------------------------
  /**
   * MainButton
   * Botón que siempre dirige al repositorio oficial de Talberos (Open Source).
   */
  function MainButton() {
    const handleClick = () => {
      window.open('https://github.com/gabrielmiguelok/talberos', '_blank');
    };
    return (
      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          bgcolor: NAVBAR_TEXT_COLOR,
          fontFamily: 'var(--font-family-main)',
          textTransform: 'none',
          color: NAVBAR_BUTTON_BG,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: NAVBAR_TEXT_COLOR,
          },
        }}
      >
        Talberos es LIBRE !
      </Button>
    );
  }

  /**
   * AuthToggleButton
   * Muestra "Iniciar sesión" (con ícono VpnKey) o "Cerrar sesión" (con PowerSettingsNewIcon).
   */
  function AuthToggleButton() {
    const tooltipTitle = isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión';
    const handleAuthToggle = () => {
      if (isAuthenticated) handleLogout();
      else handleLogin();
    };
    return (
      <Tooltip title={tooltipTitle}>
        <IconButton
          onClick={handleAuthToggle}
          size="medium"
          sx={{
            border: 2,
            color: NAVBAR_BUTTON_BG,
            background: '#1F1F1F',
            '&:hover': {
              backgroundColor: NAVBAR_HOVER_BG,
            },
          }}
          aria-label={tooltipTitle}
        >
          {isAuthenticated ? (
            <PowerSettingsNewIcon fontSize="medium" />
          ) : (
            <VpnKeyIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  /**
   * BlogButton
   * Nuevo botón para redirigir a la página principal del Blog (/blog).
   */
  function BlogButton() {
    const handleNavigateBlog = () => {
      router.push('/blog');
    };
    return (
      <Button
        variant="contained"
        onClick={handleNavigateBlog}
        sx={{
          bgcolor: NAVBAR_TEXT_COLOR,
          fontFamily: 'var(--font-family-main)',
          textTransform: 'none',
          color: NAVBAR_BUTTON_BG,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: NAVBAR_TEXT_COLOR,
          },
        }}
      >
        Blog
      </Button>
    );
  }

  // -------------------------------------------------------------------------
  // [G] BARRA DE NAVEGACIÓN (DESKTOP Y MÓVIL)
  // -------------------------------------------------------------------------
  /**
   * DesktopNav
   * Muestra botones en línea (repositorio, blog, autenticación) cuando no estamos en móvil.
   */
  function DesktopNav() {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <MainButton />
        <BlogButton />
        <AuthToggleButton />
      </Box>
    );
  }

  /**
   * MobileMenuContent
   * Menú lateral para pantallas pequeñas (Drawer).
   */
  function MobileMenuContent() {
    return (
      <Box
        sx={{
          width: '250px',
          height: '100%',
          backgroundColor: NAVBAR_BACKGROUND,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon sx={{ color: NAVBAR_BUTTON_BG }} />
          </IconButton>
        </Box>

        {/* Botón de repositorio */}
        <Box onClick={() => setMobileMenuOpen(false)}>
          <MainButton />
        </Box>

        {/* Botón de Blog */}
        <Box onClick={() => setMobileMenuOpen(false)}>
          <BlogButton />
        </Box>

        {/* Botón de login/logout */}
        <Box onClick={() => setMobileMenuOpen(false)}>
          <AuthToggleButton />
        </Box>
      </Box>
    );
  }

  /**
   * NavBarContent
   * Estructura principal del AppBar (barra superior).
   */
  function NavBarContent() {
    return (
      <AppBar
        sx={{
          width: '100%',
          height: navHeight,
          background: NAVBAR_BACKGROUND,
          color: NAVBAR_TEXT_COLOR,
          boxShadow: NAVBAR_ELEVATION,
          fontFamily: 'var(--font-family-main)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Toolbar
          sx={{
            minHeight: navHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
          }}
        >
          {/* Logo: vuelve a home al hacer clic */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.04)' },
              '&:active': {
                transform: 'scale(0.98)',
                outline: `1px solid ${NAVBAR_TEXT_COLOR}`,
              },
            }}
            onClick={() => router.push('/')}
            aria-label="Logo"
          >
            <img
              src="/logo.svg"
              alt="Logo Talberos"
              style={{ width: '60px', height: 'auto' }}
            />
          </Box>

          {/* Vista desktop vs. mobile */}
          {isMobile ? (
            <IconButton onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon sx={{ color: NAVBAR_BUTTON_BG }} />
            </IconButton>
          ) : (
            <DesktopNav />
          )}
        </Toolbar>
      </AppBar>
    );
  }

  // -------------------------------------------------------------------------
  // [H] RENDER PRINCIPAL
  // -------------------------------------------------------------------------
  return (
    <>
      {isDocked ? (
        // MODO "ACOPLADO" (Dock)
        <div
          ref={dockRef}
          style={{
            width: '100%',
            height: navHeight,
            position: 'relative',
          }}
        >
          <NavBarContent />

          {/* Área "transparente" para permitir arrastrar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: navHeight,
              backgroundColor: 'transparent',
              cursor: 'grab',
            }}
            {...bind()}
          />
        </div>
      ) : (
        // MODO "DESACOPLADO": Menú flotante que se arrastra
        <animated.div
          style={{
            position: 'absolute',
            top: floatStyle.top,
            left: floatStyle.left,
            width: floatStyle.width,
            height: floatStyle.height,
            zIndex: 9999,
            userSelect: 'none',
            cursor: 'grab',
            transform: springStyle.x
              .to((x) => `translateX(${x}px)`)
              .concat(springStyle.y.to((y) => ` translateY(${y}px)`)),
          }}
          {...bind()}
        >
          <NavBarContent />
        </animated.div>
      )}

      {/* Menú lateral para móvil */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { backgroundColor: 'transparent' },
        }}
        ModalProps={{
          onBackdropClick: () => setMobileMenuOpen(false),
        }}
      >
        <MobileMenuContent />
      </Drawer>
    </>
  );
}
