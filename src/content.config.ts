import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["en", "zh-cn"]),
    section: z.enum(["start", "guides", "interop", "reference", "support"]),
    order: z.number().int().positive(),
    release: z.string(),
    sourceLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .min(1),
  }),
});

export const collections = { docs };
