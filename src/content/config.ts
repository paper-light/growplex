import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "Product Update",
      "Ideas & Validation",
      "Founder Mindset",
      "AI & Automation",
      "Product & Tech",
      "Monetization",
      "Design & UX",
      "Growth & Marketing",
    ]),
    tags: z.array(z.string()),
    image: z.string().optional(),
    pubDate: z.coerce.date(),
    updDate: z.coerce.date(),
  }),
});

export const collections = { blog };
