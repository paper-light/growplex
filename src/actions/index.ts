import { defineAction } from "astro:actions";

import { indexWebHandler, IndexWebSchema } from "./knowledge/index-web";
import { indexDocsHandler, IndexDocsSchema } from "./knowledge/index-docs";
import { crawlUrlHandler, CrawlUrlSchema } from "./crawler/crawl-url";

import { feedbackHandler, FeedbackSchema } from "./tickets/feedback-send";
import {
  webMainCTAHandler,
  WebMainCTASchema,
} from "./tickets/web-main-cta-send";

export const server = {
  sendCTA: defineAction({
    input: WebMainCTASchema,
    handler: webMainCTAHandler,
  }),

  indexWeb: defineAction({
    input: IndexWebSchema,
    handler: indexWebHandler,
  }),

  indexDocs: defineAction({
    input: IndexDocsSchema,
    handler: indexDocsHandler,
  }),

  crawlUrl: defineAction({
    input: CrawlUrlSchema,
    handler: crawlUrlHandler,
  }),

  sendFeedback: defineAction({
    input: FeedbackSchema,
    handler: feedbackHandler,
  }),
};
