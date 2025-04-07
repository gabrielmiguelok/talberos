"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /services/blog/remarkPluginsService.js
 *
 * DESCRIPCIÓN:
 *   - Plugins de remark para:
 *     1) Quitar diacríticos
 *     2) Generar un ID personalizado (sin "user-content-")
 *     3) Recolectar headings
 *     4) Encapsular cada heading en <section> (opcional)
 *
 * LICENCIA: MIT
 */
import { visit } from "unist-util-visit";

/**
 * 1) Elimina tildes y diacríticos
 */
export function remarkNormalizeHeadings() {
  return (tree) => {
    visit(tree, "heading", (node) => {
      if (node.children && node.children.length) {
        node.children.forEach((child) => {
          if (child.type === "text" && typeof child.value === "string") {
            child.value = child.value
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
          }
        });
      }
    });
  };
}

/**
 * 2) Genera un ID "limpio" en node.data.id y node.data.hProperties.id
 *    Ej: <h2 id="por-que-usar-chatflow">
 */
export function remarkCustomSlug() {
  return (tree) => {
    visit(tree, "heading", (node) => {
      let headingText = "";
      node.children.forEach((child) => {
        if (child.type === "text") {
          headingText += child.value.trim();
        }
      });

      const customId = headingText
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      node.data = node.data || {};
      node.data.id = customId;
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.id = customId;
    });
  };
}

/**
 * 3) Recolecta headings (depth, text, id) en file.data.headings
 */
export function remarkCollectHeadings() {
  return (tree, file) => {
    const headings = [];
    visit(tree, "heading", (node) => {
      let headingText = "";
      node.children.forEach((child) => {
        if (child.type === "text") {
          headingText += child.value;
        }
      });
      const headingId = node?.data?.id || "";
      headings.push({
        depth: node.depth,
        text: headingText,
        id: headingId,
      });
    });
    file.data.headings = headings;
  };
}

/**
 * 4) Envuelve heading + contenido en <section id="...">
 *    hasta siguiente heading de igual o menor profundidad
 */
export function remarkWrapSections() {
  return (tree) => {
    const newChildren = [];
    let currentSection = null;
    let currentDepth = 0;

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];

      if (node.type === "heading") {
        if (currentSection && node.depth <= currentDepth) {
          newChildren.push(currentSection);
          currentSection = null;
        }
        if (!currentSection) {
          currentSection = {
            type: "section",
            data: {
              hName: "section",
              hProperties: {
                // el ID de la sección igual al heading
                id: node.data?.hProperties?.id || "",
              },
            },
            children: [],
          };
          currentDepth = node.depth;
        }
        currentSection.children.push(node);
      } else {
        if (currentSection) {
          currentSection.children.push(node);
        } else {
          newChildren.push(node);
        }
      }
    }
    if (currentSection) {
      newChildren.push(currentSection);
    }
    tree.children = newChildren;
  };
}
