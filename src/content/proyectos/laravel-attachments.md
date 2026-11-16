---
titulo: Laravel Attachments
resumen: "Paquete Composer con DDD para el manejo de archivos adjuntos en aplicaciones Laravel 12 multi-tenant."
rol: Desarrollador backend
fecha: 2026-09-02
orden: 4
stack: [Laravel 12, PHP, DDD, Flysystem, Pest]
agentes: []
repo: https://github.com/Fsjaimes/composer-adjuntos
---

## Qué hace

Valida el contenido real de cada archivo, decide dónde guardarlo según el tenant y el propósito, lo escribe con Flysystem (disco local, S3 o SFTP) y registra sus metadatos.

## Cómo está construido

Organizado por el dominio de adjuntos, con contratos públicos para el almacenamiento y el registro, de forma que cada aplicación puede cambiar la implementación sin tocar el resto. Probado con Pest.
