---
titulo: Tutorial Screencast
resumen: "Skill para Claude Code que convierte el tema de un tutorial en un video de 60 a 90 segundos que simula una grabación de pantalla."
rol: Autor
fecha: 2026-11-09
orden: 2
stack: [HyperFrames, HTML]
agentes: [Claude Code]
repo: https://github.com/Fsjaimes/skill-tutorial-screencast
---

## Qué hace

A partir del tema de un tutorial o de un guion borrador, genera un video 1920×1080 a 60 fps: réplica de la interfaz, cursor animado, zooms sobre la zona importante, rótulos por paso, e intro y cierre de marca.

## Cómo está construido

Es una skill de Claude Code que se apoya en HyperFrames, que renderiza HTML a MP4. Cada video queda como un proyecto editable y se renderiza siempre igual.
