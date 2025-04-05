#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# MIT License
#
# Copyright (c) 2025
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
"""
==============================================================================
Script de ejemplo que aplica principios SOLID de manera muy estricta y sin uso
de herencia para generar íconos, previews y convertir .webp a .ico.

IMPORTANTE: Este ajuste permite mantener la transparencia (si existe) en todos
los formatos que la soportan (PNG, WEBP, ICO). El único caso donde no es
posible conservar transparencia es en formato JPG (por limitaciones del propio
formato).

FUNCIONALIDAD:

OPCIÓN 1:
    - Convertir TODOS los archivos .webp a .ico en el directorio.
      Se genera un .ico por cada .webp con el mismo nombre base,
      forzando reemplazo si el .ico ya existía.

OPCIÓN 2:
    - A partir de 'logo.png' (o el que se indique en las constantes), generar:
        * favicon-16x16.png (16x16)   -> mantiene transparencia si existiera
        * favicon-32x32.png (32x32)   -> mantiene transparencia si existiera
        * apple-touch-icon.png (180x180)  -> mantiene transparencia si existiera
        * favicon.ico con múltiples tamaños (16,32,48,64), manteniendo transparencia
        * preview.png  -> copia exacta (mantiene transparencia, si hay)
        * preview.jpg  -> forzosamente sin transparencia (el formato JPG no la soporta)
        * preview.webp -> mantiene transparencia si existiera

Se reemplazan los archivos existentes, si ya estaban.

REQUISITOS:
    pip install Pillow

USO:
    cd /ruta/donde/esta/este/script
    python generate_missing_icons.py

==============================================================================
"""

import os
import asyncio
from PIL import Image

###############################################################################
#                       CONFIGURACIÓN RÁPIDAMENTE EDITABLE
###############################################################################

# Archivo base para generar íconos y previews
LOGO_FILENAME: str = "logo.png"

# Para la conversión de .webp a .ico
# (tamaño único para el .ico resultante; se puede cambiar a gusto)
WEBP_TO_ICO_SIZE: int = 64

# Nombre y tamaños de los íconos PNG a generar
FAVICON_16: str = "favicon-16x16.png"
FAVICON_16_SIZE: tuple[int, int] = (16, 16)

FAVICON_32: str = "favicon-32x32.png"
FAVICON_32_SIZE: tuple[int, int] = (32, 32)

APPLE_TOUCH_ICON: str = "apple-touch-icon.png"
APPLE_TOUCH_ICON_SIZE: tuple[int, int] = (180, 180)

# Favicon .ico a generar y sus múltiples tamaños
FAVICON_ICO: str = "favicon.ico"
FAVICON_ICO_SIZES: list[int] = [16, 32, 48, 64]

# Nombres de los previews a generar
PREVIEW_PNG: str = "preview.png"
PREVIEW_JPG: str = "preview.jpg"
PREVIEW_WEBP: str = "preview.webp"

###############################################################################
# Ruta del script
###############################################################################
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

###############################################################################
# RESPONSABILIDAD: Manejo de carga/guardado de imágenes
###############################################################################
class ImageIOManager:
    """
    Clase encargada de manejar la lectura y escritura de imágenes con Pillow.
    No realiza transformaciones, sólo carga y guarda.
    """

    @staticmethod
    def load_image(path: str) -> Image.Image:
        """
        Carga una imagen desde 'path' y la retorna como objeto PIL.Image.
        Lanza excepción si no puede cargar la imagen.
        """
        if not path or not os.path.exists(path):
            raise FileNotFoundError(f"No se encontró el archivo: {path}")
        return Image.open(path)

    @staticmethod
    def save_image(img: Image.Image, path: str, img_format: str, **kwargs) -> None:
        """
        Guarda la imagen 'img' en 'path' usando 'img_format' (p.e. 'PNG', 'ICO', 'JPEG').
        Acepta parámetros extra como quality, sizes (para ICO), etc.
        Lanza excepción si no puede guardar la imagen.
        """
        if not img:
            raise ValueError("No se puede guardar una imagen nula.")
        if not path:
            raise ValueError("Ruta de destino no válida.")

        img.save(path, format=img_format, **kwargs)

###############################################################################
# RESPONSABILIDAD: Conversión de modo para mantener/corregir alpha
###############################################################################
class ImageModeConverter:
    """
    Clase para manejar la conversión de modo de color.
    """

    @staticmethod
    def ensure_rgba(img: Image.Image) -> Image.Image:
        """
        Convierte la imagen a RGBA si no lo está ya, para
        mantener transparencia en formatos que la soportan.
        """
        if img.mode != "RGBA":
            return img.convert("RGBA")
        return img

    @staticmethod
    def ensure_rgb(img: Image.Image) -> Image.Image:
        """
        Convierte la imagen a RGB. Útil para formatos como JPEG
        que no soportan transparencia.
        """
        if img.mode != "RGB":
            return img.convert("RGB")
        return img

###############################################################################
# RESPONSABILIDAD: Redimensionar imágenes
###############################################################################
class ImageResizer:
    """
    Clase encargada de redimensionar una imagen a un tamaño dado.
    """

    @staticmethod
    def resize(img: Image.Image, size: tuple[int, int]) -> Image.Image:
        """
        Redimensiona 'img' a 'size' (w, h) usando LANCZOS y retorna la nueva imagen.
        """
        return img.resize(size, Image.LANCZOS)

###############################################################################
# RESPONSABILIDAD: Convertir todos los archivos .webp a .ico
###############################################################################
class WebpToIcoConverter:
    """
    Convierte todos los .webp encontrados en el directorio en .ico,
    siempre reemplazando si ya existía el archivo .ico.
    """

    def __init__(self, script_dir: str, ico_size: int = 64):
        self.script_dir = script_dir
        self.ico_size = ico_size

    async def convert_all_webp_to_ico(self) -> None:
        """
        Busca todos los .webp en el directorio y los convierte a .ico
        con el mismo nombre base, siempre sobrescribiendo el .ico.
        """
        webp_files = [
            f for f in os.listdir(self.script_dir) if f.lower().endswith(".webp")
        ]
        if not webp_files:
            print("No se encontraron archivos .webp en el directorio.")
            return

        tasks = [self._convert_single_webp(file_name) for file_name in webp_files]
        await asyncio.gather(*tasks)

    async def _convert_single_webp(self, file_name: str) -> None:
        """
        Lógica interna para convertir un archivo .webp en .ico,
        redimensionado a self.ico_size, conservando transparencia.
        """
        base_name, _ = os.path.splitext(file_name)
        source_path = os.path.join(self.script_dir, file_name)
        ico_path = os.path.join(self.script_dir, f"{base_name}.ico")

        try:
            img = ImageIOManager.load_image(source_path)
            # Convertir a RGBA para mantener alpha si existe
            img_rgba = ImageModeConverter.ensure_rgba(img)

            # Redimensionar (por defecto a 64x64, salvo que se cambie la constante)
            resized = ImageResizer.resize(img_rgba, (self.ico_size, self.ico_size))

            # Guardar .ico (un solo tamaño)
            ImageIOManager.save_image(resized, ico_path, "ICO", sizes=[(self.ico_size, self.ico_size)])
            print(f"✅ Generado (reemplazado si existía): {base_name}.ico")
        except Exception as e:
            print(f"❌ Error convirtiendo '{file_name}' a .ico: {e}")

###############################################################################
# RESPONSABILIDAD: Generar íconos y previsualizaciones desde 'logo.png'
###############################################################################
class LogoAssetsGenerator:
    """
    Genera:
      - favicon-16x16.png (16x16)
      - favicon-32x32.png (32x32)
      - apple-touch-icon.png (180x180)
      - favicon.ico con múltiples tamaños (16,32,48,64)
      - preview.png  (mismo tamaño, manteniendo transparencia)
      - preview.jpg  (mismo tamaño, sin transparencia, JPG no soporta alpha)
      - preview.webp (mismo tamaño, manteniendo transparencia)
    Siempre sobrescribe si el archivo ya existe.
    """

    def __init__(self, script_dir: str, logo_filename: str = "logo.png"):
        self.script_dir = script_dir
        self.logo_filename = logo_filename
        self.logo_path = os.path.join(script_dir, logo_filename)

    async def generate_all_assets(self) -> None:
        """
        Genera todos los archivos de íconos y previews, siempre reemplazando.
        """
        if not os.path.exists(self.logo_path):
            print(f"❌ No se encontró '{self.logo_filename}' en el directorio.")
            return

        try:
            img = ImageIOManager.load_image(self.logo_path)
        except Exception as e:
            print(f"❌ Error abriendo '{self.logo_filename}': {e}")
            return

        # Disparamos las subtareas en paralelo
        tasks = [
            self._generate_png_icons(img),
            self._generate_favicon_ico(img),
            self._generate_preview_images(img),
        ]
        await asyncio.gather(*tasks)

    async def _generate_png_icons(self, base_img: Image.Image) -> None:
        """
        Genera:
            - favicon-16x16.png
            - favicon-32x32.png
            - apple-touch-icon.png (180x180)
        Manteniendo transparencia en PNG si existe.
        """
        icon_targets = [
            (FAVICON_16, FAVICON_16_SIZE),
            (FAVICON_32, FAVICON_32_SIZE),
            (APPLE_TOUCH_ICON, APPLE_TOUCH_ICON_SIZE),
        ]

        for filename, (w, h) in icon_targets:
            out_path = os.path.join(self.script_dir, filename)
            try:
                # Asegurar modo RGBA para preservar transparencia
                img_rgba = ImageModeConverter.ensure_rgba(base_img)
                resized = ImageResizer.resize(img_rgba, (w, h))
                ImageIOManager.save_image(resized, out_path, "PNG", quality=95)
                print(f"✅ Generado (reemplazado si existía): {filename} ({w}x{h})")
            except Exception as e:
                print(f"❌ Error generando '{filename}': {e}")

    async def _generate_favicon_ico(self, base_img: Image.Image) -> None:
        """
        Genera el archivo .ico (favicon.ico) con múltiples tamaños (FAVICON_ICO_SIZES).
        Mantiene transparencia si la hubiera.
        """
        ico_path = os.path.join(self.script_dir, FAVICON_ICO)
        try:
            img_rgba = ImageModeConverter.ensure_rgba(base_img)
            icon_list = []
            for size in FAVICON_ICO_SIZES:
                resized = ImageResizer.resize(img_rgba, (size, size))
                icon_list.append(resized)

            ImageIOManager.save_image(
                icon_list[0],
                ico_path,
                "ICO",
                sizes=[(s, s) for s in FAVICON_ICO_SIZES],
            )
            print(f"✅ Generado (reemplazado si existía): {FAVICON_ICO}")
        except Exception as e:
            print(f"❌ Error generando '{FAVICON_ICO}': {e}")

    async def _generate_preview_images(self, base_img: Image.Image) -> None:
        """
        Genera:
          - preview.png  (mismo tamaño que el original, conservando transparencia)
          - preview.jpg  (mismo tamaño, sin transparencia, JPG no la soporta)
          - preview.webp (mismo tamaño, manteniendo transparencia)
        Siempre sobrescribe si existían.
        """
        await self._generate_preview_png(base_img)
        await self._generate_preview_jpg(base_img)
        await self._generate_preview_webp(base_img)

    async def _generate_preview_png(self, base_img: Image.Image) -> None:
        """
        Crea 'preview.png' con el mismo tamaño y manteniendo transparencia.
        """
        out_path = os.path.join(self.script_dir, PREVIEW_PNG)
        try:
            # Aseguramos RGBA para un PNG con alpha si aplica
            img_rgba = ImageModeConverter.ensure_rgba(base_img)
            # Se deja el mismo tamaño; no se redimensiona
            ImageIOManager.save_image(img_rgba, out_path, "PNG", quality=95)
            print(f"✅ Generado (reemplazado): {PREVIEW_PNG}")
        except Exception as e:
            print(f"❌ Error generando '{PREVIEW_PNG}': {e}")

    async def _generate_preview_jpg(self, base_img: Image.Image) -> None:
        """
        Crea 'preview.jpg' con el mismo tamaño.
        El formato JPG no soporta transparencia, así que se pasa a RGB.
        """
        out_path = os.path.join(self.script_dir, PREVIEW_JPG)
        try:
            img_rgb = ImageModeConverter.ensure_rgb(base_img)
            ImageIOManager.save_image(img_rgb, out_path, "JPEG", quality=95)
            print(f"✅ Generado (reemplazado): {PREVIEW_JPG}")
        except Exception as e:
            print(f"❌ Error generando '{PREVIEW_JPG}': {e}")

    async def _generate_preview_webp(self, base_img: Image.Image) -> None:
        """
        Crea 'preview.webp' con el mismo tamaño y mantiene transparencia (WEBP sí soporta).
        """
        out_path = os.path.join(self.script_dir, PREVIEW_WEBP)
        try:
            img_rgba = ImageModeConverter.ensure_rgba(base_img)
            ImageIOManager.save_image(img_rgba, out_path, "WEBP", quality=95)
            print(f"✅ Generado (reemplazado): {PREVIEW_WEBP}")
        except Exception as e:
            print(f"❌ Error generando '{PREVIEW_WEBP}': {e}")


###############################################################################
# RESPONSABILIDAD: Orquestar la ejecución según la opción seleccionada
###############################################################################
async def main() -> None:
    """
    Función principal asíncrona. Solicita al usuario:
      1) Convertir .webp -> .ico
      2) Generar favicon y apple-touch-icon + previews desde 'LOGO_FILENAME'
    """
    print("¿Qué acción desea realizar?")
    print("1) Convertir TODOS los archivos .webp a .ico (mismo nombre base).")
    print("2) Generar favicon, apple-touch-icon y previews a partir de 'logo.png'.")
    opcion = input("Ingrese 1 o 2 y presione [Enter]: ").strip()

    if opcion == "1":
        converter = WebpToIcoConverter(SCRIPT_DIR, WEBP_TO_ICO_SIZE)
        await converter.convert_all_webp_to_ico()
    elif opcion == "2":
        generator = LogoAssetsGenerator(SCRIPT_DIR, LOGO_FILENAME)
        await generator.generate_all_assets()
    else:
        print("Opción no válida. Saliendo...")


###############################################################################
#                            PUNTO DE ENTRADA
###############################################################################
if __name__ == "__main__":
    asyncio.run(main())
