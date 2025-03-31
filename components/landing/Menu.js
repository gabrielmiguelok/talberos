'use client';

/**
 * MIT License
 * -----------
 * Archivo: /components/Menu.js
 *
 * DESCRIPCIÓN:
 *   - Este componente representa un menú de navegación flotante que permite gestionar la autenticación del usuario,
 *     el acceso al repositorio y el cierre de sesión.
 *   - Se elimina la capacidad de cambiar de tema en la barra de navegación, reemplazándola por un toggle de autenticación
 *     que permite iniciar o cerrar sesión.
 *   - El botón principal ahora muestra "Talberos Gratis" y redirige a https://github.com/gabrielmiguelok/talberos.
 *   - Se sigue una arquitectura modular y se aplican los principios SOLID:
 *       * SRP: Cada función tiene una única responsabilidad.
 *       * OCP: El componente es fácilmente extensible sin modificar la estructura base.
 *       * LSP: Los componentes pueden ser sustituidos sin alterar el comportamiento.
 *       * ISP: Las interfaces son específicas y livianas.
 *       * DIP: Se abstraen las dependencias (rutas, autenticación) para facilitar futuros cambios.
 *   - Actualización: Se corrige la solicitud al endpoint de logout para utilizar el método POST y se actualizan los íconos
 *     de iniciar y cerrar sesión a VpnKeyIcon y PowerSettingsNewIcon, respectivamente, para una mejor representación.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Tooltip, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useRouter } from 'next/router';

// Íconos para la barra de navegación
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
// Íconos actualizados para autenticación:
// - VpnKeyIcon para iniciar sesión (representa el acceso seguro mediante clave)
// - PowerSettingsNewIcon para cerrar sesión (representa la acción de desconexión)
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

export default function Menu({
  isDarkMode = true,
  navHeight = 60,
  dockThreshold = 40,
}) {
  // Estado de autenticación y control de UI
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isDocked, setIsDocked] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Referencia para la posición acoplada del menú
  const dockRef = useRef(null);
  const [floatStyle, setFloatStyle] = useState({
    top: 0,
    left: 0,
    width: '100%',
    height: navHeight,
  });

  // Configuración de animación para el arrastre
  const [springStyle, api] = useSpring(() => ({ x: 0, y: 0 }));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  // Estilos y colores fijos para la barra de navegación
  const NAVBAR_BACKGROUND = 'linear-gradient(135deg, #FF00AA 50%, #1F1F1F 80%)';
  const NAVBAR_TEXT_COLOR = '#1F1F1F';
  const NAVBAR_BUTTON_BG = '#FF00AA';
  const NAVBAR_HOVER_BG = '#FF00AA';
  const NAVBAR_ELEVATION = '0px 2px 8px rgba(0, 0, 0, 0.7)';

  /**
   * Verifica la autenticación del usuario al montar el componente.
   * Realiza una solicitud al endpoint /api/auth/verify para obtener el estado actual.
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

  /**
   * Controla la funcionalidad de arrastre del menú flotante.
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
        api.start({ x: ox, y: oy });
        if (last) {
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

  /**
   * Redirige al usuario al endpoint de login.
   */
  const handleLogin = () => router.push('/api/auth/google');

  /**
   * Envía una solicitud POST al endpoint de logout para cerrar sesión.
   * Actualiza el estado de autenticación y redirige al usuario a la página principal.
   */
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setIsAuthenticated(false);
        setUserEmail(null);
        router.push('/');
      } else {
        console.error('Error al cerrar sesión: ', response.statusText);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Botón principal que siempre muestra "Talberos es Gratis" y redirige
   * al repositorio de Talberos en GitHub.
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
        Open Source !
      </Button>
    );
  }

  /**
   * Botón toggle de autenticación.
   * Muestra "Iniciar sesión" (con VpnKeyIcon) si el usuario no está autenticado,
   * o "Cerrar sesión" (con PowerSettingsNewIcon) si ya lo está.
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
            background: "#1F1F1F",
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
   * Contenido de la barra de navegación para escritorio.
   */
  function DesktopNav() {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <MainButton />
        <AuthToggleButton />
      </Box>
    );
  }

  /**
   * Contenido del menú lateral para dispositivos móviles.
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

        <Box onClick={() => setMobileMenuOpen(false)}>
          <MainButton />
        </Box>

        <Box onClick={() => setMobileMenuOpen(false)}>
          <AuthToggleButton />
        </Box>
      </Box>
    );
  }

  /**
   * Estructura principal de la barra de navegación (AppBar).
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
          {/* Logo: Redirige al home al hacer clic */}
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

          {/* Selección entre menú móvil y de escritorio */}
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

  /**
   * Renderiza el menú flotante en función de si está acoplado o no.
   */
  return (
    <>
      {isDocked ? (
        <div
          ref={dockRef}
          style={{
            width: '100%',
            height: navHeight,
            position: 'relative',
          }}
        >
          <NavBarContent />
          {/* Área draggable superpuesta (transparente) */}
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
