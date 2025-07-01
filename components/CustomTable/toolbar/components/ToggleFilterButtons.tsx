/**
 * Archivo: /components/registros/toolbar/components/ToggleFilterButtons.js
 */
import React, { memo } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';

const COMMON_ICON_STYLES = {
  transition: 'none',
  p: 0.3,
  mr: 0.5,
  fontSize: '18px',
  '&:hover': {
    backgroundColor: 'transparent'
  }
};

// Hasta 4 estados
function getColorFromState(state) {
  switch (state) {
    case 1:
      return '#00ff0a'; // verde
    case 2:
      return '#ff0000'; // rojo
    case 3:
      return '#41a9ff'; // azul
    default:
      return '#ffffff'; // blanco por omisión
  }
}

function ToggleFilterButtons({
  whatsAppState,
  setWhatsAppState,
  correoActive,
  setCorreoActive,
  destacadoState,
  setDestacadoState,
  googleMyBusinessState,
  setGoogleMyBusinessState,
  webState,
  setWebState
}) {
  // 3 estados genérico
  const cycleGeneric3States = (current) => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    return 0;
  };
  // GMB => 0->2->1->0
  const cycleGMB3States = (current) => {
    if (current === 0) return 2;
    if (current === 2) return 1;
    return 0;
  };
  // Web (4 estados) => 0->1->2->3->0
  const cycleWeb4States = (current) => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    if (current === 2) return 3;
    return 0;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* WhatsApp */}
      <Tooltip title="Filtro condicional, si esta marcado en verde, al confirmar el filtro, solo serán visibles los registros que se haya verificado que su teléfono cuenta con un whatsapp activo, si esta en rojo, lo opuesto.">
        <IconButton
          onClick={() => setWhatsAppState((prev) => cycleGeneric3States(prev))}
          sx={{
            ...COMMON_ICON_STYLES,
            color: getColorFromState(whatsAppState)
          }}
        >
          <WhatsAppIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      {/* Correo (2 estados) */}
      <Tooltip title="Filtro condicional, si esta marcado en verde, al confirmar el filtro, solo serán visibles los que se haya encontrado un email.">
        <IconButton
          onClick={() => setCorreoActive((prev) => !prev)}
          sx={{
            ...COMMON_ICON_STYLES,
            // AHORA: por defecto blanco en vez de gris
            color: correoActive ? '#00ff0a' : '#ffffff'
          }}
        >
          <MarkEmailReadIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      {/* Destacado */}
      <Tooltip title="Filtro condicional, si está blanco, no filtra nada, en verde, filtrara registros que hayan sido detectado como 'destacados'. Lo que significa que en la url que tienen en google maps, no es un sitio web optimo.">
        <IconButton
          onClick={() => setDestacadoState((prev) => cycleGeneric3States(prev))}
          sx={{
            ...COMMON_ICON_STYLES,
            color: getColorFromState(destacadoState)
          }}
        >
          {destacadoState === 0 ? (
            <StarBorderIcon fontSize="inherit" />
          ) : (
            <StarIcon fontSize="inherit" />
          )}
        </IconButton>
      </Tooltip>

      {/* Google My Business */}
      <Tooltip title="Filtro condiconal. Al marcar este filtro en rojo y confirmar el filtro, condicionará a que solo aparezcan filtros que no hayan sido reclamados en google maps.">
        <IconButton
          onClick={() => setGoogleMyBusinessState((prev) => cycleGMB3States(prev))}
          sx={{
            ...COMMON_ICON_STYLES,
            color: getColorFromState(googleMyBusinessState)
          }}
        >
          <BusinessIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      {/* Web (4 estados) */}
      <Tooltip title="Filtro condicional. Al marcar este filtro en verde, condicionará para ver únicamente los registros que si o si tengan una url en el campo web de google maps. Si se apreta nuevamente, se filtraran únicamente los que se hayan encontrado 2 url y si se marca en rojo, los que no se encontraron una url.">
        <IconButton
          onClick={() => setWebState((prev) => cycleWeb4States(prev))}
          sx={{
            ...COMMON_ICON_STYLES,
            color: getColorFromState(webState)
          }}
        >
          {webState === 3 ? (
            <Badge
              badgeContent={2}
              color="#00ff0a"
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <PublicIcon fontSize="inherit" />
            </Badge>
          ) : (
            <PublicIcon fontSize="inherit" />
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default memo(ToggleFilterButtons);
