/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /services/blogService.js
 *
 * DESCRIPCIÓN:
 *  - Contiene las funciones para leer y procesar archivos .md|.mdx desde la carpeta /blogs.
 *  - Incorpora la lógica de extracción de frontmatter y formateo de slugs.
 *
 * PRINCIPIOS SOLID:
 *  - SRP: Servicio exclusivo para la lógica de obtención de posts.
 *  - OCP: Fácil de extender si deseas añadir nuevos metadatos o cambios en la lectura.
 *  - DIP: Consumido por las páginas (index y [article]) a través de una abstracción simple.
 *
 * LICENCIA: MIT
 */
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

/**
 * Elimina prefijos numéricos del nombre del archivo.
 * Ej: "10.MiArticulo" => "MiArticulo"
 * @param {string} str Nombre de archivo base
 * @returns {string} Nombre sin el prefijo numérico
 */
function removeNumericPrefix(str) {
  return str.replace(/^(\d+)\.\s*/, "");
}

/**
 * Obtiene la lista de archivos (nombre y orden) desde /blogs
 * y retorna un array de objetos { slug, order, frontMatter }.
 *
 * @returns {Promise<Array>} posts
 */
export async function getAllPosts() {
  const blogsDir = path.join(process.cwd(), "blogs");
  let files = [];

  // Lectura de la carpeta /blogs
  try {
    files = await fs.readdir(blogsDir);
  } catch (error) {
    console.error("[BLOG SERVICE] Error leyendo la carpeta /blogs:", error);
    return [];
  }

  // Filtra solo archivos .md o .mdx
  const markdownFiles = files.filter(
    (file) => file.endsWith(".md") || file.endsWith(".mdx")
  );

  // Array para acumular posts
  const posts = [];

  for (const file of markdownFiles) {
    const fullPath = path.join(blogsDir, file);

    // Extrae orden numérico al inicio del nombre (ej. "10." => 10) para luego ordenar
    let fileOrder = 0;
    const matchOrder = file.match(/^(\d+)\./);
    if (matchOrder && matchOrder[1]) {
      fileOrder = parseInt(matchOrder[1], 10);
    }

    // Quitamos la extensión al nombre y el prefijo numérico para el slug
    const baseName = file.replace(/\.(md|mdx)$/, "");
    const slug = removeNumericPrefix(baseName);

    try {
      const fileContent = await fs.readFile(fullPath, "utf8");
      const { data } = matter(fileContent);

      posts.push({
        slug,
        order: fileOrder,
        frontMatter: {
          title: data.title || "Artículo sin título",
          description: data.description || "",
          image: data.image || null,
          date: data.date || null,
        },
      });
    } catch (err) {
      console.error(`[BLOG SERVICE] Error procesando ${file}:`, err);
    }
  }

  // Ordena DESC por el número extraído
  posts.sort((a, b) => b.order - a.order);

  return posts;
}

/**
 * Obtiene todos los slugs (sin prefijo numérico) para generar rutas estáticas.
 * @returns {Promise<Array>} slugs
 */
export async function getAllSlugs() {
  const blogsDir = path.join(process.cwd(), "blogs");
  const filenames = await fs.readdir(blogsDir);

  // Devuelve solo .md o .mdx
  const validFiles = filenames.filter((file) =>
    file.endsWith(".md") || file.endsWith(".mdx")
  );

  return validFiles.map((file) => {
    const base = file.replace(/\.(md|mdx)$/, "");
    return removeNumericPrefix(base);
  });
}
