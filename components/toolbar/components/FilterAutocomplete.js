/**
 * Archivo: /components/registros/toolbar/components/FilterAutocomplete.js
 */
import React from 'react';
import { Autocomplete, Checkbox, TextField } from '@mui/material';

const SELECTED_BADGE_STYLES = {
  display: 'inline-block',
  backgroundColor: '#e3f2fd',
  color: '#0055aa',
  borderRadius: '6px',
  padding: '1px 6px',
  fontSize: '0.7rem',
  marginRight: '4px',
  whiteSpace: 'nowrap',
  fontWeight: 500
};

export default function FilterAutocomplete({
  label,
  options,
  value,
  onChange,
  popupWidth = '200px',
  popupHeight = '180px'
}) {
  const safeOptions = (options || []).filter(Boolean);
  const safeValue = (value || []).filter(Boolean);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={safeOptions}
      value={safeValue}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(option, val) => option === val}
      renderTags={(val) => {
        if (!val || val.length === 0) return null;
        if (val.length === 1) {
          return <span style={SELECTED_BADGE_STYLES}>{val[0]}</span>;
        }
        return <span style={SELECTED_BADGE_STYLES}>{val.length} sel.</span>;
      }}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            fontSize: '0.8rem',
            color: '#ffffff',
            lineHeight: 1.3,
            cursor: 'pointer'
          }}
        >
          <Checkbox
            checked={selected}
            sx={{
              p: 0,
              ml: 0,
              mr: 1,
              color: '#41a9ff',
              '&.Mui-checked': { color: '#41a9ff' }
            }}
          />
          <span style={{ flex: 1 }}>{option}</span>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          label={label}
          sx={{
            width: '130px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              backgroundColor: '#fff',
              minHeight: '30px',
              lineHeight: 1.2,
              padding: '0 6px'
            },
            '& .MuiOutlinedInput-input': {
              padding: '4px 0',
              fontSize: '0.75rem'
            },
            '& .MuiFormLabel-root': {
              fontSize: '0.65rem',
              lineHeight: 1.2
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ccd4db'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0055aa'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0055aa'
            }
          }}
        />
      )}
      ListboxProps={{
        style: {
          width: popupWidth,
          minWidth: popupWidth,
          maxWidth: popupWidth,
          height: popupHeight,
          minHeight: popupHeight,
          maxHeight: popupHeight,
          overflowY: 'auto',
          borderRadius: '6px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: 0
        }
      }}
    />
  );
}
