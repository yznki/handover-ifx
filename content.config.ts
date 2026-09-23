import { defineCollection, defineContentConfig, z } from "@nuxt/content";

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
        section: z.enum(["start", "aida", "cvc", "valibridge", "reference"]).optional(),
        owner: z.string().optional(),
        updated: z.string().optional(),
        note: z.string().optional(),
        headline: z.string().optional(),
        subline: z.string().optional(),
        links: z.array(z.object({ label: z.string(), to: z.string() })).optional()
      })
    })
  }
});
