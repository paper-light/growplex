import z from "zod";
import { defineAction } from "astro:actions";

import { tgHandler, TGSchema } from "./notification/tg";
import { seedHandler } from "./user/seed";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),

  seedUser: defineAction({
    input: z.object({
      userId: z.string(),
      provider: z.enum(["google"]).nullable(),
    }),
    handler: seedHandler,
  }),
};
