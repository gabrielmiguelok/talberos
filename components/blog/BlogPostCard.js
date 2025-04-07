/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/BlogPostCard.js
 *
 * DESCRIPCIÓN:
 *  - Muestra la información básica de un post (imagen, título, fecha, descripción).
 *  - Incluye el link "Leer más" hacia la ruta dinámica del artículo.
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Único objetivo: Componente UI para un post.
 *  - DIP: Depende de props abstractas (post) y no de implementaciones de lectura.
 *
 * LICENCIA: MIT
 */
import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

import {
  BLOG_CARD_BG_COLOR,
  BLOG_CARD_TEXT_COLOR,
  BLOG_CARD_BOX_SHADOW,
  BLOG_CARD_BORDER_RADIUS,
  BLOG_CARD_HOVER_TRANSFORM,
  BLOG_CARD_HOVER_SHADOW,
  BLOG_POST_TITLE_SIZE,
  BLOG_POST_TITLE_WEIGHT,
  BLOG_POST_TITLE_COLOR,
  BLOG_POST_DATE_COLOR,
  BLOG_POST_DESCRIPTION_COLOR,
  BLOG_POST_DESCRIPTION_LINE_HEIGHT,
  BLOG_READ_MORE_COLOR,
  BLOG_READ_MORE_WEIGHT,
} from "@constants/blog/blogStyles";

export default function BlogPostCard({ post }) {
  const {
    slug,
    frontMatter: { image, title, date, description },
  } = post;

  return (
    <Box
      sx={{
        backgroundColor: BLOG_CARD_BG_COLOR,
        color: BLOG_CARD_TEXT_COLOR,
        boxShadow: BLOG_CARD_BOX_SHADOW,
        borderRadius: BLOG_CARD_BORDER_RADIUS,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: "320px",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: BLOG_CARD_HOVER_TRANSFORM,
          boxShadow: BLOG_CARD_HOVER_SHADOW,
        },
      }}
    >
      {/* Imagen destacada del post */}
      {image && (
        <Box sx={{ width: "100%", height: "180px", position: "relative" }}>
          <Image
            src={image}
            alt={title || "Imagen del artículo"}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}

      {/* Datos del post */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Typography
          component="h3"
          sx={{
            fontSize: BLOG_POST_TITLE_SIZE,
            mb: 1,
            fontWeight: BLOG_POST_TITLE_WEIGHT,
            color: BLOG_POST_TITLE_COLOR,
          }}
        >
          {title}
        </Typography>

        {date && (
          <Typography
            component="p"
            sx={{
              fontSize: "0.875rem",
              color: BLOG_POST_DATE_COLOR,
              mb: 1,
            }}
          >
            {new Date(date).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        )}

        {description && (
          <Typography
            component="p"
            sx={{
              mb: 2,
              flexGrow: 1,
              color: BLOG_POST_DESCRIPTION_COLOR,
              lineHeight: BLOG_POST_DESCRIPTION_LINE_HEIGHT,
              fontSize: "0.95rem",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Enlace "Leer más" */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Link href={`/blog/${slug}`} passHref legacyBehavior>
            <a
              style={{
                color: BLOG_READ_MORE_COLOR,
                fontWeight: BLOG_READ_MORE_WEIGHT,
                textDecoration: "none",
              }}
              aria-label={`Leer más sobre: ${title}`}
            >
              Leer más →
            </a>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
