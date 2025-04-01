/************************************************************************************
 * UBICACIÓN DEL ARCHIVO: /next-sitemap.config.js
 ************************************************************************************/
const fs = require('fs');
const path = require('path');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://talberos.tech',
  generateRobotsTxt: false, // Desactiva la creación del archivo robots.txt
  exclude: [],
  /**
   * Genera rutas adicionales para el blog.
   * Se leen los archivos .md de la carpeta /blogs y se crea una entrada para cada uno.
   */
  additionalPaths: async () => {
    const blogDir = path.join(__dirname, 'blogs');
    let files = [];
    try {
      files = fs.readdirSync(blogDir);
    } catch (err) {
      console.error('Error al leer la carpeta "blogs":', err);
    }
    const mdFiles = files.filter(file => file.endsWith('.md'));
    const paths = mdFiles.map(file => {
      const slug = file.replace(/\.md$/, '');
      return {
        loc: `/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0]
      };
    });
    return paths;
  }
};
