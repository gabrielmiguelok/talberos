/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/BlogList.js
 *
 * DESCRIPCIÓN:
 *  - Recibe un array de posts y los mapea en un grid de tarjetas (BlogPostCard).
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Renderiza la lista de posts. Nada más.
 *  - SoC: No contiene lógica de lectura de archivos o SEO, solo la UI de la lista.
 *
 * LICENCIA: MIT
 */

import React from "react";
import { Box } from "@mui/material";
import {
  BLOG_CARD_BG_COLOR,
  BLOG_CARD_TEXT_COLOR,
  MAX_CONTENT_WIDTH,
} from "@constants/blog/blogStyles";
import BlogPostCard from "./BlogPostCard";

export default function BlogList({ posts = [] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr",
        },
        gap: 3,
      }}
    >
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </Box>
  );
}
