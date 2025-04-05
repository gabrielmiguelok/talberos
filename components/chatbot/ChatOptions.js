/****************************************************************************************
 * File: ChatOptions.jsx
 * --------------------------------------------------------------------------------------
 * - Muestra una lista de opciones como botones (se usan para cambiar de estado en el chat).
 * - Importa los estilos desde ChatStylesConfig.
 ****************************************************************************************/
import React from 'react';
import { Stack, Button } from '@mui/material';

import { CHAT_OPTIONS_STYLES } from './ChatStylesConfig';

export default function ChatOptions({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={CHAT_OPTIONS_STYLES.stackContainer}
    >
      {options.map((option, i) => (
        <Button
          key={i}
          variant="contained"
          color="primary"
          onClick={() => onSelect(option)}
          sx={CHAT_OPTIONS_STYLES.optionButton}
        >
          {option}
        </Button>
      ))}
    </Stack>
  );
}
