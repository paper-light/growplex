import { defineAction } from "astro:actions";

import { tgHandler, TGSchema } from "./notification/tg";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),
};
