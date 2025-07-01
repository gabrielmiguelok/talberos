import React, { memo, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';

class FilterApplyFlow {
  constructor(onApplyFilters) {
    this.onApplyFilters = onApplyFilters;
  }
  applyAll() {
    this.onApplyFilters();
  }
}

class FilterResetFlow {
  constructor(onResetFilters) {
    this.onResetFilters = onResetFilters;
  }
  resetAll() {
    this.onResetFilters();
  }
}

const BUTTON_STYLES = {
  transition: 'none !important',
  backgroundColor: 'transparent !important',
  p: 0.3,
  mr: 0.5,
  fontSize: '18px',
  '&:hover': {
    backgroundColor: '#eee !important'
  }
};

function ApplyResetGroup({ onApplyFilters, onResetFilters, onRefresh, sxButton }) {
  const [applyStage, setApplyStage] = useState('idle');

  const handleApplyClick = () => {
    const applyFlow = new FilterApplyFlow(onApplyFilters);
    applyFlow.applyAll();
    setApplyStage((prev) =>
      prev === 'idle' ? 'temporal' : prev === 'temporal' ? 'confirmed' : 'temporal'
    );
  };

  const handleResetClick = async () => {
    // 1) Resetea filtros
    const resetFlow = new FilterResetFlow(onResetFilters);
    resetFlow.resetAll();

    // 2) Llamamos a onRefresh para volver a cargar data del email
    if (onRefresh) {
      await onRefresh();
    }

    setApplyStage('idle');
  };

  const getApplyButtonColor = () => {
    switch (applyStage) {
      case 'temporal':
        return '#fbc02d'; // amarillo
      case 'confirmed':
        return '#00ff0a'; // verde
      default:
        return sxButton?.color || '#333'; // gris
    }
  };

  return (
    <>
      <Tooltip title="Tocá 2 veces para aplicar filtros" disableInteractive arrow>
        <IconButton
          onClick={handleApplyClick}
          sx={{
            ...BUTTON_STYLES,
            ...sxButton,
            color: `${getApplyButtonColor()} !important`
          }}
        >
          <CheckIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Reiniciar filtros y recargar" disableInteractive arrow>
        <IconButton
          onClick={handleResetClick}
          sx={{
            ...BUTTON_STYLES,
            ...sxButton,
            color: '#d32f2f !important'
          }}
        >
          <RefreshIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default memo(ApplyResetGroup);
