import { defineAction } from "astro:actions";

import { tgHandler, TGSchema } from "./notification/tg";
import { seedHandler, SeedUserSchema } from "./user/seed";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),

  seedUser: defineAction({
    input: SeedUserSchema,
    handler: seedHandler,
  }),
};
