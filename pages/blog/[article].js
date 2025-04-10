"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /pages/blog/[article].js
 *
 * DESCRIPCIÓN:
 *   - Página dinámica para renderizar artículos .md o .mdx desde /blogs.
 *   - Genera automáticamente un índice de contenidos (TOC) con TableOfContents.
 *
 * LICENCIA: MIT
 */
import React from "react";
import BlogArticleLayout from "@components/blog/BlogArticleLayout";
import TableOfContents from "@components/blog/TableOfContents";

// Servicio para obtener slugs
import { getAllSlugs } from "@services/blog/blogService";
// Servicio para obtener data de un artículo
import { fetchArticleData } from "@services/blog/articleService";

const FALLBACK_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const fallbackImages = {
  fallbackImageWebp: FALLBACK_BASE_URL + "/images/preview/preview.webp",
  fallbackImagePng: FALLBACK_BASE_URL + "/images/preview/preview.png",
  fallbackImageJpg: FALLBACK_BASE_URL + "/images/preview/preview.jpg",
};

export async function getStaticPaths() {
  const slugs = await getAllSlugs();
  const paths = slugs.map((slug) => ({
    params: { article: slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { article } = params;
  const articleData = await fetchArticleData(article);

  if (!articleData) {
    return { notFound: true };
  }

  return {
    props: {
      ...articleData,
    },
  };
}

export default function BlogArticlePage({
  frontMatter,
  isMdx,
  mdxSource,
  htmlContent,
  headings,
  pageUrl,
  jsonLdData,
}) {
  const {
    title = "Talberos Open Source",
    description = "Artículo de blog en Talberos",
    image = null,
    keywords = [],
    date = null,
    author = "Talberos Team",
  } = frontMatter;

  return (
    <BlogArticleLayout
      title={title}
      description={description}
      date={date}
      author={author}
      image={image}
      pageUrl={pageUrl}
      jsonLdData={jsonLdData}
      keywords={keywords}
      isMdx={isMdx}
      mdxSource={mdxSource}
      htmlContent={htmlContent}
      TableOfContents={TableOfContents}
      headings={headings}
      fallbackImages={fallbackImages}
    />
  );
}
