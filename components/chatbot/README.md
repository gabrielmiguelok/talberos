# Chatbot con Flujos de Conversación en React

Este repositorio contiene un componente de chat diseñado para aplicaciones en React y Next.js. Utiliza un sistema de estados para guiar al usuario a través de diferentes pantallas, preguntas y respuestas, permitiendo una experiencia de asistente conversacional adaptable.

---

## Índice
1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Instalación](#instalación)
5. [Uso](#uso)
   - [Integración en la App](#integración-en-la-app)
   - [Personalización de Estilos](#personalización-de-estilos)
6. [Ejemplo Rápido](#ejemplo-rápido)
7. [Arquitectura y Principios](#arquitectura-y-principios)
8. [Preguntas Frecuentes](#preguntas-frecuentes)
9. [Contribución](#contribución)
10. [Licencia](#licencia)

---

## Descripción General
El sistema de chat contenido en este repositorio permite gestionar **conversaciones guiadas** en una aplicación React. Utiliza una máquina de estados para presentar preguntas, respuestas y opciones al usuario. Con él, se pueden crear recorridos interactivos, asistentes virtuales y tutoriales dentro de un mismo componente.

Entre los objetivos principales, se encuentran la **modularidad**, la **configuración centralizada** de estilos y la **integración sencilla** con cualquier proyecto que use React o Next.js.

---

## Características Principales
- **Asistente Interactivo**: El usuario envía entradas y recibe respuestas basadas en el estado actual.
- **Opciones en Pantalla**: Botones para navegar rápidamente entre diferentes pantallas o temas.
- **Configuración de Estilos en un Solo Archivo**: Facilita la modificación de colores, fuentes y layouts.
- **Soporte Markdown**: Se pueden incluir listados, enlaces e incluso realces especiales usando notación Markdown.
- **Ícono Flotante Arrastrable**: Abre/cierra el chat desde cualquier parte de la pantalla.
- **Enfoque Orientado a Flujos**: Cada interacción del usuario puede dirigirlo a un nuevo estado definido en un archivo de configuración.

---

## Estructura de Carpetas
La organización interna facilita la lectura y el mantenimiento:

```
components/
  └─ chatbot/
      ├─ ChatModal.jsx          (Componente principal del chat)
      ├─ ChatMessage.jsx        (Mensajes del usuario y asistente)
      ├─ ChatOptions.jsx        (Botones de opciones)
      ├─ ChatStylesConfig.js    (Estilos centralizados)
      ├─ ChatFlowManager.js     (Maneja la lógica de transición de estados)
      ├─ steps/
      │   ├─ index.js           (Agrupa todos los pasos)
      │   ├─ menu/
      │   ├─ features/
      │   ├─ faq/
      │   ├─ saberMas/
      │   ├─ contact/
      │   └─ final/
      ├─ common/
      │   ├─ ButtonsConfig.js   (Textos de los botones)
      │   └─ FlowUtils.js       (Acciones comunes)
      └─ FloatingChatIcon.js    (Ícono flotante para abrir el chat)
```

Cada subcarpeta en `steps/` representa un **bloque de conversación** o un **estado**.

---

## Instalación
1. Clonar o descargar este repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```
3. Iniciar la aplicación (en caso de que exista un demo incluido):
   ```bash
   npm run dev
   # o
   yarn dev
   ```

---

## Uso

### Integración en la App
1. **Copiar** la carpeta `components/chatbot` en tu proyecto.
2. **Importar** y usar en tu layout principal o en una página específica:
   ```jsx
   import { useState } from 'react';
   import ChatModal from './components/chatbot/ChatModal';
   import FloatingChatIcon from './components/chatbot/FloatingChatIcon';

   export default function MyApp() {
     const [openChat, setOpenChat] = useState(false);

     const handleOpenChat = () => {
       setOpenChat(true);
     };

     const handleCloseChat = () => {
       setOpenChat(false);
       // Emite un evento para mostrar de nuevo el ícono flotante
       window.dispatchEvent(new Event('show-floating-icon'));
     };

     return (
       <>
         {openChat && <ChatModal onClose={handleCloseChat} />}
         <FloatingChatIcon onClick={handleOpenChat} />
       </>
     );
   }
   ```
3. Ajustar rutas de importación según tu estructura de carpetas.
4. Verificar que el ícono flotante aparezca y abra el chat al hacer clic.

### Personalización de Estilos
- El archivo `ChatStylesConfig.js` agrupa **todos los colores**, tamaños y gradientes. Modifícalo para:
  - Cambiar la paleta de colores.
  - Ajustar alturas/anchos del modal.
  - Personalizar las propiedades de los botones.
- Reemplaza `logo.png` con tu propia imagen en la carpeta `public/`, si lo deseas.

---

## Ejemplo Rápido
En la carpeta `example/` (o la que hayas definido) podrías encontrar una integración mínima:

```jsx
import React, { useState } from 'react';
import ChatModal from '../components/chatbot/ChatModal';
import FloatingChatIcon from '../components/chatbot/FloatingChatIcon';

export default function ExamplePage() {
  const [chatVisible, setChatVisible] = useState(false);

  const openChat = () => {
    setChatVisible(true);
  };

  const closeChat = () => {
    setChatVisible(false);
    window.dispatchEvent(new Event('show-floating-icon'));
  };

  return (
    <main>
      <h1>Ejemplo de Integración</h1>
      {chatVisible && <ChatModal onClose={closeChat} />}
      <FloatingChatIcon onClick={openChat} />
    </main>
  );
}
```

Este código muestra un ícono flotante que, al hacer clic, despliega el chat con las pantallas configuradas.

---

## Arquitectura y Principios
Este chat se diseñó teniendo en cuenta:
- **Modularidad**: Los mensajes y opciones están separados en `steps/`, facilitando la modificación.
- **SOLID**: Cada archivo cumple una responsabilidad específica, promoviendo fácil mantenimiento.
- **Estilos Unificados**: Se utiliza un único archivo para configurar el look & feel del chat.
- **Hooks y React**: Uso de hooks para manejar estado y efectos.

El flujo funciona a través de un archivo central (`ChatFlowManager.js`) que, a partir del estado actual y la entrada del usuario, determina el próximo estado y los mensajes a mostrar.

---

## Preguntas Frecuentes
- **¿Cómo agrego un nuevo estado o paso al chat?**
  1. Crea un archivo en `steps/` con la definición de mensajes y opciones.
  2. Expórtalo en `steps/index.js`.
  3. Añade la lógica en `ChatFlowManager.js` (switch-case) o la acción correspondiente en `FlowUtils.js`.

- **¿Es posible cambiar los textos de los botones globalmente?**
  - Sí, en `common/ButtonsConfig.js`.

- **¿Puedo incluir enlaces o formato en las respuestas del asistente?**
  - Sí, se utiliza `react-markdown` con `remark-gfm` para Markdown avanzado.

- **¿Qué sucede si quiero ocultar el ícono flotante en un momento determinado?**
  - Controla el estado y no montes `<FloatingChatIcon />`. Al cerrar el chat, vuelve a mostrarlo con el evento `'show-floating-icon'`.

---

## Contribución
Se aceptan mejoras, optimizaciones de código, correcciones de bugs y nuevas funciones. Para contribuir:
1. Realiza un fork de este repositorio.
2. Crea una rama con la propuesta.
3. Envía tu pull request para revisión.

Si encuentras un problema, abre un [issue en GitHub](#) describiendo los pasos para reproducirlo.

---

## Licencia
Este proyecto se distribuye bajo la [Licencia MIT](https://opensource.org/licenses/MIT). Esto implica:
- Uso libre (incluso comercial).
- Modificación y redistribución ilimitada.
- Sin garantía implícita o explícita.

Cualquier aporte o sugerencia es bienvenida para seguir mejorando este componente de chat.

