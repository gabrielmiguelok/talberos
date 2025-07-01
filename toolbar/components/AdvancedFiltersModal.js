/**
 * Archivo: /components/registros/toolbar/components/AdvancedFiltersModal.jsx
 */
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAutocomplete from './FilterAutocomplete';
import { socialNetworksOptions } from '../../../utils/socialNetworksOptions';

export default function AdvancedFiltersModal({
  open,
  onClose,
  onApply,
  resetKey,

  // Autocompletes
  busquedas,
  setBusquedas,
  ciudades,
  setCiudades,
  paises,
  setPaises,
  destacados,
  setDestacados,
  emails,
  setEmails,
  userEmail,
  availableEmails,
  availableBusquedas,
  availableCiudades,
  availablePaises,
  availableDestacados,

  // Redes Sociales
  socialNetworks,
  setSocialNetworks,

  // Fechas
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const selectedLabels = socialNetworksOptions
    .filter((sn) => socialNetworks.includes(sn.value))
    .map((sn) => sn.label);

  const handleChangeSocialNetworks = (newLabels) => {
    const selectedValues = socialNetworksOptions
      .filter((opt) => newLabels.includes(opt.label))
      .map((opt) => opt.value);
    setSocialNetworks(selectedValues);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 600px)',
          bgcolor: '#ffffff',
          borderRadius: '8px',
          boxShadow: 24,
          p: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros Avanzados
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#555' }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ mt: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 1 }}>
            <FilterAutocomplete
              key={`paises-${resetKey}`}
              label="Países"
              options={availablePaises}
              value={paises}
              onChange={setPaises}
              popupWidth="220px"
              popupHeight="180px"
            />

            <FilterAutocomplete
              key={`ciudades-${resetKey}`}
              label="Ciudades"
              options={availableCiudades}
              value={ciudades}
              onChange={setCiudades}
              popupWidth="220px"
              popupHeight="180px"
            />

            <FilterAutocomplete
              key={`busquedas-${resetKey}`}
              label="Búsquedas"
              options={availableBusquedas}
              value={busquedas}
              onChange={setBusquedas}
              popupWidth="220px"
              popupHeight="180px"
            />

            <FilterAutocomplete
              key={`destacados-${resetKey}`}
              label="Destacados"
              options={availableDestacados}
              value={destacados}
              onChange={setDestacados}
              popupWidth="220px"
              popupHeight="180px"
            />

            <FilterAutocomplete
              key={`redes-${resetKey}`}
              label="Redes Sociales"
              options={socialNetworksOptions.map((sn) => sn.label)}
              value={selectedLabels}
              onChange={handleChangeSocialNetworks}
              popupWidth="220px"
              popupHeight="180px"
            />
          </Stack>

          {['ceo@synara.ar', 'lucia@synara.ar'].includes(userEmail) && (
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              <FilterAutocomplete
                key={`emails-${resetKey}`}
                label="Emails (registros)"
                options={availableEmails}
                value={emails}
                onChange={setEmails}
                popupWidth="220px"
                popupHeight="180px"
              />
            </Stack>
          )}

          {/* Fechas */}
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <TextField
              key={`startDate-${resetKey}`}
              label="Fecha Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              key={`endDate-${resetKey}`}
              label="Fecha Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={handleApply} variant="contained" color="primary">
            Aplicar
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cerrar
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
