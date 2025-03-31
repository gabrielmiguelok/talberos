#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script en Python para ofrecer dos opciones al ejecutarlo:

OPCIÓN 1: Convertir TODOS los archivos .webp en el directorio actual a .ico,
          generando archivos con el mismo nombre base que el archivo fuente.
          Si ya existe el archivo .ico para un .webp, se omite la conversión.

OPCIÓN 2: A partir de 'logo.png', generar:
          - favicon-16x16.png  (16x16)
          - favicon-32x32.png  (32x32)
          - apple-touch-icon.png (180x180)
          - favicon.ico con múltiples tamaños [16, 32, 48, 64]

Requisitos:
    pip install Pillow

Uso:
    cd /ruta/donde/esta/este/script
    python generate_missing_icons.py
"""

import os
from PIL import Image

# Directorio donde se ejecuta el script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def flatten_image_to_white(img: Image.Image) -> Image.Image:
    """
    Recibe una imagen 'img'. Si tiene canal alpha,
    la aplana con fondo blanco y la convierte a 'RGB'.
    Si no tiene alpha, simplemente la convierte a 'RGB'.
    """
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGBA', img.size, (255, 255, 255, 255))
        background.paste(img, (0, 0), img)
        return background.convert('RGB')
    return img.convert('RGB')


def convert_all_webp_to_ico():
    """
    Opción 1: Convierte todos los archivos .webp a .ico,
    manteniendo el mismo nombre base del archivo fuente.
    Si el archivo .ico ya existe, se omite la conversión.
    """
    webp_files = [f for f in os.listdir(SCRIPT_DIR) if f.lower().endswith('.webp')]

    if not webp_files:
        print("No se encontraron archivos .webp en el directorio.")
        return

    for file_name in webp_files:
        base_name, _ = os.path.splitext(file_name)
        source_path = os.path.join(SCRIPT_DIR, file_name)
        ico_path = os.path.join(SCRIPT_DIR, f"{base_name}.ico")

        # Verificar si el .ico ya existe
        if os.path.exists(ico_path):
            print(f"(SKIP) '{base_name}.ico' ya existe. Omitiendo conversión para '{file_name}'.")
            continue

        try:
            img = Image.open(source_path)
            img_rgb = flatten_image_to_white(img)

            # Redimensionar a 64x64 (o el tamaño que prefieras para el .ico)
            img_64 = img_rgb.resize((64, 64), Image.LANCZOS)

            # Guardar como .ico con un solo tamaño
            img_64.save(ico_path, format='ICO', sizes=[(64, 64)])
            print(f"✅ Generado: {base_name}.ico (fuente: {file_name})")
        except Exception as e:
            print(f"❌ Error convirtiendo '{file_name}' a .ico: {e}")


def generate_icons_from_logo():
    """
    Opción 2: Toma 'logo.png' y genera:
      - favicon-16x16.png
      - favicon-32x32.png
      - apple-touch-icon.png (180x180)
      - favicon.ico con múltiples tamaños [16, 32, 48, 64]
    """
    logo_path = os.path.join(SCRIPT_DIR, "logo.png")
    if not os.path.exists(logo_path):
        print("❌ No se encontró 'logo.png' en el directorio.")
        return

    try:
        img = Image.open(logo_path)
        img_rgb = flatten_image_to_white(img)
    except Exception as e:
        print(f"❌ Error abriendo 'logo.png': {e}")
        return

    # Lista de tamaños y nombres
    targets = [
        ("favicon-16x16.png", (16, 16)),
        ("favicon-32x32.png", (32, 32)),
        ("apple-touch-icon.png", (180, 180)),
    ]

    # Generar cada PNG
    for filename, (w, h) in targets:
        out_path = os.path.join(SCRIPT_DIR, filename)
        if os.path.exists(out_path):
            print(f"(SKIP) '{filename}' ya existe. Omitiendo.")
            continue

        try:
            resized = img_rgb.resize((w, h), Image.LANCZOS)
            resized.save(out_path, format='PNG', quality=95)
            print(f"✅ Generado: {filename} ({w}x{h})")
        except Exception as e:
            print(f"❌ Error generando '{filename}': {e}")

    # Generar favicon.ico con varios tamaños
    ico_path = os.path.join(SCRIPT_DIR, "favicon.ico")
    if os.path.exists(ico_path):
        print("(SKIP) 'favicon.ico' ya existe. Omitiendo.")
    else:
        try:
            # Crearemos versiones reescaladas para [16, 32, 48, 64]
            icon_sizes = [16, 32, 48, 64]
            icon_list = []
            for size in icon_sizes:
                icon_list.append(img_rgb.resize((size, size), Image.LANCZOS))

            # Guardar .ico con múltiples tamaños
            icon_list[0].save(
                ico_path,
                format='ICO',
                sizes=[(size, size) for size in icon_sizes]
            )
            print("✅ Generado: favicon.ico (múltiples tamaños)")
        except Exception as e:
            print(f"❌ Error generando 'favicon.ico': {e}")


def main():
    print("¿Qué acción desea realizar?")
    print("1) Convertir TODOS los archivos .webp a .ico (mismo nombre base).")
    print("2) Generar favicon y apple-touch-icon a partir de 'logo.png'.")
    opcion = input("Ingrese 1 o 2 y presione [Enter]: ").strip()

    if opcion == '1':
        convert_all_webp_to_ico()
    elif opcion == '2':
        generate_icons_from_logo()
    else:
        print("Opción no válida. Saliendo...")


if __name__ == '__main__':
    main()
