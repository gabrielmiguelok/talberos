"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/blog/index.js
 *
 * DESCRIPCIÓN:
 *  - Página principal del Blog de Talberos, parte del ecosistema integral.
 *  - Hace uso del servicio getAllPosts() para obtener la lista de posts.
 *  - Renderiza el layout (BlogLayout) y la lista de posts (BlogList).
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Unir datos (posts) con layout y renderizado (BlogList).
 *  - DIP: Depende de blogService y componentes abstractos en lugar de implementación fija.
 *
 * LICENCIA: MIT
 */

import React from "react";
import { getAllPosts } from "@services/blog/blogService";
import BlogLayout from "@components/blog/BlogLayout";
import BlogList from "@components/blog/BlogList";

export default function BlogIndexPage({ posts }) {
  return (
    <BlogLayout posts={posts}>
      {/* BlogList se encarga de mapear y mostrar las tarjetas */}
      <BlogList posts={posts} />
    </BlogLayout>
  );
}

// ----------------------------------------------------------------------------
// getStaticProps: LEE FICHEROS .MD Y .MDX DESDE LA CARPETA /blogs
// ----------------------------------------------------------------------------
export async function getStaticProps() {
  const posts = await getAllPosts();

  return {
    props: { posts },
  };
}
