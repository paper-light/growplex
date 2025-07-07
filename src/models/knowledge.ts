import z from "zod";

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.string(), z.any()),
  chunkCount: z.number(),
  tokenCount: z.number(),
  created: z.string(),
  updated: z.string(),
});

export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),

  documents: z.array(z.string()),
  metadata: z.record(z.string(), z.any()),
  indexed: z.string(),
  created: z.string(),
  updated: z.string(),

  expand: z.object({
    documents: z.array(DocumentSchema).optional(),
  }),
});
