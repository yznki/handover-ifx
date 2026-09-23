import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const StoryBeatSchema = z.object({
  statement: z.string(),
  support: z.string().optional(),
  note: z.string().optional(),
  visual: z.string().optional()
});

export default defineContentConfig({
  collections: {
    documents: defineCollection({
      source: "**/*.md",
      type: "page",
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        chapter: z.string().optional(),
        order: z.number().optional(),
        note: z.string().optional(),
        beats: z.array(StoryBeatSchema).optional(),
        links: z.array(z.object({ label: z.string(), to: z.string() })).optional()
      })
    })
  }
});
