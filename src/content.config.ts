import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    rol: z.string(),
    fecha: z.coerce.date(),
    stack: z.array(z.string()).default([]),
    agentes: z.array(z.string()).default([]),
    orden: z.number().default(0),
    portada: z.string().optional(),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    destacado: z.boolean().default(false),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { proyectos };
