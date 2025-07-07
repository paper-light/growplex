import z from "zod";
import { defineAction } from "astro:actions";

import { UserSchema } from "../models";

import { tgHandler, TGSchema } from "./notification/tg";
import { seedHandler } from "./user/seed";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),

  seedUser: defineAction({
    input: z.object({
      user: UserSchema,
      provider: z.enum(["google"]).nullable(),
    }),
    handler: seedHandler,
  }),
};
