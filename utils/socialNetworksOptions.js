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

// Carga dinámica de íconos de react-icons/si para el ícono de X
let siIcons = {};
try {
  siIcons = require('react-icons/si');
} catch (err) {
  // Si ocurre algún error, se mantiene como {}
}

/**
 * Devuelve la referencia al ícono de siIcons, o null si no existe.
 * @param {string} iconName - nombre exacto de la propiedad (p.ej: "SiX")
 */
function loadIconSafely(iconName) {
  return siIcons && siIcons[iconName] ? siIcons[iconName] : null;
}
const SafeSiX = loadIconSafely('SiX');

/**
 * Opciones de redes sociales. Ajusta los links a tus urls reales.
 */
export const socialNetworksOptions = [
  {
    label: 'Facebook',
    value: 'facebook',
    icon: <FaFacebook />,
    color: '#3b5998',
    link: 'https://www.facebook.com/synara.tech',
  },
  {
    label: 'Instagram',
    value: 'instagram',
    icon: <FaInstagram />,
    color: '#E1306C',
    link: 'https://www.instagram.com/synara.tech',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin',
    icon: <FaLinkedin />,
    color: '#0077B5',
    link: 'https://www.linkedin.com/company/synaratech',
  },
  {
    label: 'YouTube',
    value: 'youtube',
    icon: <FaYoutube />,
    color: '#FF0000',
    link: 'https://www.youtube.com/synara.tech',
  },
  {
    label: 'WhatsApp',
    value: 'whatsapp',
    icon: <FaWhatsapp />,
    color: '#25D366',
    link: 'https://api.whatsapp.com/send?phone=5492364655702',
  },
  {
    label: 'TikTok',
    value: 'tiktok',
    icon: <FaTiktok />,
    color: '#000000',
    link: 'https://www.tiktok.com/@synara.tech',
  },
  {
    label: 'X',
    value: 'twitter',
    icon: SafeSiX ? <SafeSiX /> : <FaTwitter />,
    color: '#000000',
    link: 'https://www.twitter.com/synara.tech',
  },
];
