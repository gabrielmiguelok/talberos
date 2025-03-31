// @utils/socialNetworksOptions.js
import React from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
  FaTwitter,
  FaTiktok
} from 'react-icons/fa';

// Carga dinámica de íconos 'SiX' (X actual) de react-icons/si
let siIcons = {};
try {
  siIcons = require('react-icons/si');
} catch (err) {
  // Si no existe o falla la import, siIcons se mantiene vacío
}

/**
 * Busca el ícono en siIcons, devolviendo null si no existe.
 * @param {string} iconName - nombre exacto (por ejemplo: "SiX").
 */
function loadIconSafely(iconName) {
  return siIcons && siIcons[iconName] ? siIcons[iconName] : null;
}

const SafeSiX = loadIconSafely('SiX');

/**
 * socialNetworksOptions
 * --------------------------------------------------------------------------
 * Lista de redes sociales de Talberos, con íconos y urls.
 */
export const socialNetworksOptions = [
  {
    label: 'Talberos Facebook',
    value: 'facebook',
    icon: <FaFacebook />,
    color: '#3b5998',
    link: 'https://www.facebook.com/talberos',
  },
  {
    label: 'Talberos Instagram',
    value: 'instagram',
    icon: <FaInstagram />,
    color: '#E1306C',
    link: 'https://www.instagram.com/talberos',
  },
  {
    label: 'Talberos LinkedIn',
    value: 'linkedin',
    icon: <FaLinkedin />,
    color: '#0077B5',
    link: 'https://www.linkedin.com/company/talberos',
  },
  {
    label: 'Talberos YouTube',
    value: 'youtube',
    icon: <FaYoutube />,
    color: '#FF0000',
    link: 'https://www.youtube.com/talberos',
  },
  {
    label: 'Talberos WhatsApp',
    value: 'whatsapp',
    icon: <FaWhatsapp />,
    color: '#25D366',
    link: 'https://api.whatsapp.com/send?phone=5492364655702',
  },
  {
    label: 'Talberos TikTok',
    value: 'tiktok',
    icon: <FaTiktok />,
    color: '#000000',
    link: 'https://www.tiktok.com/@talberos',
  },
  {
    label: 'Talberos X',
    value: 'twitter',
    icon: SafeSiX ? <SafeSiX /> : <FaTwitter />,
    color: '#000000',
    link: 'https://www.twitter.com/talberos',
  },
];
