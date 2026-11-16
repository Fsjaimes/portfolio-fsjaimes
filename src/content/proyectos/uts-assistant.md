---
titulo: UTS Assistant
resumen: "Asistente académico: subes documentos PDF, se indexan con RAG y los consultas en un chat con modelos de lenguaje."
rol: Desarrollador full stack
fecha: 2026-05-18
orden: 1
stack: [Laravel 12, Vue 3, Inertia, FastAPI, RAG]
agentes: [Claude Code]
repo: https://github.com/Fsjaimes/app-web-rag
---

## Qué hace

Permite subir documentos académicos en PDF, indexarlos con RAG (Retrieval-Augmented Generation) y hacer preguntas sobre ellos en un chat.

## Cómo está construido

Laravel 12 con Vue 3 e Inertia para la aplicación, y un microservicio en FastAPI (Python) que consume el modelo y hace la recuperación de documentos. Nginx enruta el tráfico entre los dos servicios y todo corre en Docker.
