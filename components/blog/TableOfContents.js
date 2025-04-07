"use client";
import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Crea un árbol anidado a partir de headings:
 * [ { id, depth, text }, ... ]
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

function handleHeadingClick(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

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
          {item.children && item.children.length > 0 && renderTocItems(item.children)}
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
