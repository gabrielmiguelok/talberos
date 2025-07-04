"use client";
/**
 * MIT License
 * ----------------------------------------------------------------------------
 * Archivo: /components/blog/TableOfContents.js
 *
 * DESCRIPCIÓN:
 *   - Componente para renderizar el índice de contenidos (headings) de un artículo.
 *   - Construye un árbol a partir de los headings para anidar secciones.
 *
 * LICENCIA: MIT
 */
import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Construye un árbol a partir de una lista plana de headings
 * para mostrar sub-niveles de forma jerárquica.
 */
function buildTocTree(headings) {
  const root = { depth: 0, children: [] };
  const stack = [root];

  headings.forEach((h) => {
    const newItem = { ...h, children: [] };

    while (h.depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(newItem);
    stack.push(newItem);
  });

  return root.children;
}

/**
 * Manejador de click para scrollear al heading correspondiente con offset.
 */
function handleHeadingClick(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;

  // Offset aproximado de 2cm (72px)
  const offset = 72;
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = rect.top + scrollTop - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
}

/**
 * Render recursivo de los nodos (árbol de headings).
 */
function renderTocItems(nodes) {
  return (
    <ul style={{ marginLeft: 0, paddingLeft: "1.2rem" }}>
      {nodes.map((item) => (
        <li key={item.id} style={{ margin: "0.3rem 0" }}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleHeadingClick(e, item.id)}
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            {item.text}
          </a>
          {item.children &&
            item.children.length > 0 &&
            renderTocItems(item.children)}
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({ headings = [] }) {
  if (!headings.length) return null;

  const tree = buildTocTree(headings);

  return (
    <Box
      component="nav"
      aria-label="Índice de Contenidos"
      sx={{
        border: "1px solid #CCCCCC",
        borderRadius: "4px",
        padding: "1rem",
        backgroundColor: "#FAFAFA",
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: "1rem", color: "#222" }}>
        Índice de Contenidos
      </Typography>
      {renderTocItems(tree)}
    </Box>
  );
}
