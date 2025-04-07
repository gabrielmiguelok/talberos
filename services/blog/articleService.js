"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /services/blog/articleService.js
 *
 * DESCRIPCIÓN:
 *   - Procesa artículos .md y .mdx en /blogs.
 *   - Genera un TOC (headings), asigna ID sin "user-content-",
 *     agrupa contenido en <section> y hace un post-procesado final
 *     para eliminar cualquier "user-content-" que se cuele.
 *
 * LICENCIA: MIT
 */

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

// remark
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkStringify from "remark-stringify";

// rehype
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";

import {
  remarkNormalizeHeadings,
  remarkCustomSlug,
  remarkCollectHeadings,
  remarkWrapSections,
} from "./remarkPluginsService";

// Plugin final para quitar "user-content-"
import { rehypeRemoveUserContentPrefix } from "./rehypeRemoveUserContentPrefix";

const BLOG_FOLDER_NAME = "blogs";
const FILE_EXTENSION_MD = ".md";
const FILE_EXTENSION_MDX = ".mdx";
const FALLBACK_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Quita prefijos tipo "01. "
 * Ej: "01. MiArticulo" => "MiArticulo"
 */
function removeNumericPrefix(str) {
  return str.replace(/^(\d+)\.\s*/, "");
}

export async function fetchArticleData(articleSlug) {
  // 1) Ubica el archivo real
  const blogsDir = path.join(process.cwd(), BLOG_FOLDER_NAME);
  let filenames = [];
  try {
    filenames = await fs.readdir(blogsDir);
  } catch (err) {
    console.warn("[articleService] Error leyendo /blogs:", err);
    return null;
  }

  const foundFile = filenames.find((file) => {
    if (file.endsWith(FILE_EXTENSION_MD) || file.endsWith(FILE_EXTENSION_MDX)) {
      const base = file.replace(/\.(md|mdx)$/, "");
      return removeNumericPrefix(base) === articleSlug;
    }
    return false;
  });
  if (!foundFile) return null;

  // 2) Lee el contenido
  const filePath = path.join(blogsDir, foundFile);
  let fileContent = "";
  try {
    fileContent = await fs.readFile(filePath, "utf8");
  } catch (error) {
    console.warn("[articleService] Error leyendo archivo:", error);
    return null;
  }

  // 3) .mdx o .md?
  const isMdx = foundFile.endsWith(FILE_EXTENSION_MDX);

  // 4) frontmatter
  const { data, content } = matter(fileContent);

  // 5) Generar TOC => Pipeline remark
  //    (no usamos remarkAutolinkHeadings -> evita "user-content-")
  let headings = [];
  try {
    const tocResult = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkNormalizeHeadings)
      .use(remarkCustomSlug)
      .use(remarkCollectHeadings)
      .use(remarkStringify)
      .process(content);

    headings = tocResult.data.headings || [];
  } catch (e) {
    console.warn("[TOC] Error recolectando headings:", e);
  }

  // 6) Procesar contenido final
  let mdxSource = null;
  let htmlContent = "";

  if (isMdx) {
    // === .MDX ===
    // 1) Hacemos remark con slug, etc.
    // 2) rehypeSlug + rehypeAutolinkHeadings (prefix:false)
    // 3) rehypeRemoveUserContentPrefix (por si algo lo inyecta)
    mdxSource = await serialize(content, {
      scope: data,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkNormalizeHeadings,
          remarkCustomSlug,
          remarkWrapSections,
        ],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              prefix: false,
            },
          ],
          rehypeRemoveUserContentPrefix,
        ],
      },
    });
  } else {
    // === .MD ===
    // A) Pipeline remark => HTML
    // B) Re-parse HTML con Rehype => removeUserContent => rehypeStringify
    // para forzar la eliminación definitiva de "user-content-"
    const firstPass = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkNormalizeHeadings)
      .use(remarkCustomSlug)
      .use(remarkWrapSections)
      .use(remarkHtml) // genera HTML
      .process(content);

    // (A) nos da firstPass.value con HTML
    // (B) re-parse con Rehype
    const secondPass = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRemoveUserContentPrefix)
      .use(rehypeStringify)
      .process(firstPass.value);

    htmlContent = secondPass.toString();
  }

  // 7) Imagen final
  const pageUrl = `${FALLBACK_BASE_URL}/blog/${articleSlug}`;
  let finalImageURL = null;
  if (data.image) {
    const localImagePath = path.join(process.cwd(), "public", data.image);
    try {
      await fs.access(localImagePath);
      finalImageURL = FALLBACK_BASE_URL + data.image;
    } catch (errImg) {
      console.warn("[ARTICLE] Imagen no encontrada:", localImagePath);
    }
  }

  // 8) JSON-LD
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title || "Artículo sin título",
    description: data.description || "",
    author: {
      "@type": "Person",
      name: data.author || "Talberos Team",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    keywords: data.keywords || [],
    datePublished: data.date || "",
    dateModified: data.date || "",
    ...(finalImageURL && { image: finalImageURL }),
  };

  // 9) Retornamos todo
  return {
    frontMatter: {
      ...data,
      image: finalImageURL || null,
    },
    isMdx,
    mdxSource,
    htmlContent,
    headings,
    pageUrl,
    jsonLdData,
    articleSlug,
  };
}
