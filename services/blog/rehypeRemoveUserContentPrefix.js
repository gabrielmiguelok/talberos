"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /services/blog/rehypeRemoveUserContentPrefix.js
 *
 * DESCRIPCIÓN:
 *   - Plugin Rehype que elimina el prefijo "user-content-" en los IDs y enlaces
 *     de cada heading, en caso de que algún plugin lo haya inyectado (estilo GitHub).
 *   - Deja IDs "limpios".
 *
 * LICENCIA: MIT
 */
import { visit } from "unist-util-visit";

/**
 * rehypeRemoveUserContentPrefix
 *
 * Recorre el árbol HTML final y, si detecta id="user-content-XYZ", lo reemplaza
 * por id="XYZ". También limpia enlaces href="#user-content-XYZ" -> href="#XYZ".
 *
 * Para usarlo, en tu pipeline Rehype:
 *   .use(rehypeRemoveUserContentPrefix)
 *
 */
export function rehypeRemoveUserContentPrefix() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "element") {
        // Quitar "user-content-" de IDs
        if (node.properties && typeof node.properties.id === "string") {
          node.properties.id = node.properties.id.replace(/^user-content-/, "");
        }
        // Quitar "user-content-" de href
        if (node.properties && typeof node.properties.href === "string") {
          node.properties.href = node.properties.href.replace(
            /#user-content-/,
            "#"
          );
        }
        // Quitar "user-content-" de xlink:href (casos svg, etc.)
        if (
          node.properties &&
          typeof node.properties["xlink:href"] === "string"
        ) {
          node.properties["xlink:href"] = node.properties["xlink:href"].replace(
            /#user-content-/,
            "#"
          );
        }
      }
    });
  };
}
