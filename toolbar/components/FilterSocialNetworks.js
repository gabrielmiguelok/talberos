/**
 * Archivo: /components/registros/toolbar/components/FilterSocialNetworks.jsx
 */
import React, { memo } from 'react';
import FilterAutocomplete from './FilterAutocomplete';
import { socialNetworksOptions } from '../../../utils/socialNetworksOptions';

function FilterSocialNetworks({ socialNetworks, setSocialNetworks }) {
  const selectedLabels = socialNetworksOptions
    .filter((sn) => socialNetworks.includes(sn.value))
    .map((sn) => sn.label);

  const handleChange = (newLabels) => {
    const selectedValues = socialNetworksOptions
      .filter((opt) => newLabels.includes(opt.label))
      .map((opt) => opt.value);
    setSocialNetworks(selectedValues);
  };

  return (
    <FilterAutocomplete
      label="Redes Sociales"
      options={socialNetworksOptions.map((sn) => sn.label)}
      value={selectedLabels}
      onChange={handleChange}
      popupWidth="220px"
      popupHeight="180px"
    />
  );
}

export default memo(FilterSocialNetworks);
