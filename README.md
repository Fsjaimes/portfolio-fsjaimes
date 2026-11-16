# portfolio-fsjaimes

Portafolio personal de Frank Jaimes, desarrollador Full Stack (Laravel, Vue.js, Inertia y DDD) que trabaja con agentes de código como Claude Code, Codex y Cursor.

Es un sitio estático de una sola página con animaciones 3D en Three.js, pensado para desplegarse en Netlify.

## Tecnologías

| Uso | Tecnología |
| --- | --- |
| Framework | [Astro](https://astro.build) 7 (salida estática) |
| Estilos | Tailwind CSS 4 |
| Componentes interactivos | Vue 3 (integración de Astro, disponible para islas) |
| 3D y animación | Three.js |
| Tipografía | Bricolage Grotesque (Fontsource) |
| Iconos | [Simple Icons](https://simpleicons.org) (CC0) |
| Despliegue | Netlify |

## Secciones

- **Hero**: avatar, nombre y stack principal sobre formas con efecto *liquid morph*.
- **About me**: perfil profesional.
- **Resume**: fortalezas y herramientas (agentes de código, Jira, Git, GitHub y Docker).
- **Proyectos**: galería 3D que se recorre con el scroll.
- **Formación**: línea de tiempo académica.
- **Contact me**: correo, LinkedIn y GitHub.

## Paleta

| Nombre | Hex | Uso |
| --- | --- | --- |
| Midnight Navy | `#102C40` | Fondo principal |
| Cloud White | `#F7FAFC` | Texto y fondo de Resume |
| Electric Lime | `#DBFF00` | Títulos y detalles puntuales |

Los colores están definidos como tokens de Tailwind en `src/styles/global.css` (`navy`, `cloud`, `lime`).

## Requisitos

- Node.js 22 o superior
- npm

## Uso

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:4321
npm run build     # genera el sitio en dist/
npm run preview   # sirve dist/ en local
```

## Estructura

```text
src/
├── assets/perfil.png              # Avatar
├── components/
│   ├── GaleriaProyectos.astro     # Sección de proyectos (galería 3D)
│   ├── Herramientas.astro         # Agentes de código y herramientas de equipo
│   └── Seccion.astro              # Contenedor con título animado
├── content/proyectos/*.md         # Un archivo por proyecto
├── content.config.ts              # Esquema de los proyectos
├── data/perfil.ts                 # Correo y redes
├── layouts/Base.astro             # HTML base, cabecera y menú móvil
├── pages/
│   ├── index.astro                # Página principal
│   └── proyectos/[id].astro       # Página de detalle de cada proyecto
├── scripts/
│   ├── fondo.ts                   # Campo de puntos 3D del fondo
│   ├── galeria.ts                 # Galería 3D de proyectos
│   ├── menu.ts                    # Menú móvil
│   └── revelar.ts                 # Títulos y textos que suben al hacer scroll
└── styles/global.css              # Tokens, animaciones y liquid morph
```

## Agregar o editar un proyecto

Cada proyecto es un archivo Markdown en `src/content/proyectos/`. La galería se ordena por el campo `orden`.

```markdown
---
titulo: Nombre del proyecto
resumen: "Una frase sobre qué hace. Entre comillas si lleva dos puntos."
rol: Desarrollador full stack
fecha: 2026-01-31
orden: 7
stack: [Laravel, Vue, Inertia]
agentes: [Claude Code]
repo: https://github.com/Fsjaimes/repositorio
url: https://demo.ejemplo.com        # opcional
portada: /portadas/proyecto.webp     # opcional
---

Descripción larga del proyecto.
```

Sin `portada`, la galería genera una tarjeta con el título y el stack. Para usar una captura, guarda la imagen en `public/portadas/` (formato horizontal, proporción 16:10) y apunta `portada` a esa ruta. Con `borrador: true` el proyecto no se publica.

Los datos de contacto se editan en `src/data/perfil.ts` y las herramientas en `src/components/Herramientas.astro`.

## Accesibilidad y rendimiento

- Con `prefers-reduced-motion` activado se desactivan las animaciones automáticas; la navegación sigue funcionando.
- Si el navegador no tiene WebGL, la galería muestra los proyectos como una lista de texto.
- Las animaciones 3D se pausan cuando la pestaña o la sección no están visibles, y la resolución de render está limitada a 1.5×.
- El menú móvil se maneja con teclado (Escape para cerrar, foco contenido en el menú).

## Despliegue en Netlify

La configuración está en `netlify.toml`: comando `npm run build` y carpeta publicada `dist`. Basta con conectar el repositorio en Netlify.
