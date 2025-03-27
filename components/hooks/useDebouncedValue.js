// ===================================================
// ./components/hooks/useDebouncedValue.js
// ===================================================
import { useState, useEffect } from 'react';

/**
 * Hook para mantener un valor con retardo (debounce).
 */
export function useDebouncedValue(value, delay = 2000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
