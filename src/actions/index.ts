import { defineAction } from "astro:actions";

import { UserSchema } from "../models";

import { tgHandler, TGSchema } from "./tg";
import { seedHandler } from "./seed";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),

  seedUser: defineAction({
    input: UserSchema,
    handler: seedHandler,
  }),
};
