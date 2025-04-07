/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /constants/blogStyles.js
 *
 * DESCRIPCIÓN:
 *  - Contiene todas las variables de estilo, colores, tamaños y demás constantes
 *    para el Blog de Talberos.
 *  - Se importa en los componentes y páginas para mantener un "Single Source of Truth".
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Un único archivo para configurar estilos.
 *  - OCP: Permite añadir nuevas constantes sin modificar la estructura base.
 *
 * LICENCIA: MIT
 */

// Gradientes y colores base
export const BLOG_BG_GRADIENT = "linear-gradient(135deg, #FFFFFF 30%, #1e88e5 100%)";
export const BLOG_TEXT_COLOR = "#000000";
export const BLOG_TITLE_COLOR = "#0d47a1";
export const BLOG_CARD_BG_COLOR = "#FFFFFF";
export const BLOG_CARD_TEXT_COLOR = "#000000";
export const BLOG_LINK_COLOR = "#0d47a1";

// Fuentes y tamaños
export const BLOG_MAIN_HEADING_FONT_SIZE_MOBILE = "2rem";
export const BLOG_MAIN_HEADING_FONT_SIZE_DESKTOP = "3rem";
export const BLOG_MAIN_HEADING_FONT_WEIGHT = "bold";

export const BLOG_SUBTITLE_FONT_SIZE = "1.2rem";
export const BLOG_SUBTITLE_COLOR = "#000000";
export const BLOG_SUBTITLE_MARGIN_BOTTOM = 3;

export const BLOG_INTRO_TEXT_COLOR = "#000000";
export const BLOG_INTRO_TEXT_SIZE = "1rem";
export const BLOG_INTRO_MAX_WIDTH = "auto";
export const BLOG_INTRO_LINE_HEIGHT = 1.6;

export const BLOG_CARD_BORDER_RADIUS = 2;
export const BLOG_CARD_BOX_SHADOW = 5;
export const BLOG_CARD_HOVER_TRANSFORM = "translateY(-3px) scale(1.02)";
export const BLOG_CARD_HOVER_SHADOW = "0 8px 20px rgba(0, 0, 0, 0.4)";

export const BLOG_POST_TITLE_COLOR = "#1F1F1F";
export const BLOG_POST_TITLE_SIZE = "1.3rem";
export const BLOG_POST_TITLE_WEIGHT = "bold";

export const BLOG_POST_DATE_COLOR = "#666666";
export const BLOG_POST_DESCRIPTION_COLOR = "#555555";
export const BLOG_POST_DESCRIPTION_LINE_HEIGHT = 1.6;

export const BLOG_READ_MORE_COLOR = BLOG_LINK_COLOR;
export const BLOG_READ_MORE_WEIGHT = "bold";

export const MAX_CONTENT_WIDTH = 'auto';

// Metadatos del blog
export const BLOG_TITLE = "Blog de Talberos";
export const BLOG_DESCRIPTION =
  "Bienvenido al Blog de Talberos, parte del ecosistema integral en React, 100% Open Source (MIT). Conoce las novedades y guías técnicas de nuestras herramientas.";
export const BLOG_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Imágenes por defecto para SEO
export const BLOG_IMAGE_WEBP = "/images/preview.webp";
export const BLOG_IMAGE_PNG = "/images/preview.png";
export const BLOG_IMAGE_JPG = "/images/preview.jpg";

// Keywords globales
export const BLOG_KEYWORDS = "Talberos, Blog, React, Next.js, Tableros, Open Source, MIT, Desarrollo, JavaScript, Ecosistema";
