import { defineAction } from "astro:actions";

import { tgHandler, TGSchema } from "./notification/tg";
import { indexWebHandler, IndexWebSchema } from "./knowledge/index-web";

export const server = {
  sendTG: defineAction({
    input: TGSchema,
    handler: tgHandler,
  }),

  indexWeb: defineAction({
    input: IndexWebSchema,
    handler: indexWebHandler,
  }),
};
