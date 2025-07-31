// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

// https://astro.build/config
export default defineConfig({
  // site: "https://growplex.dev",
  site: "http://localhost:2999",
  env: {
    schema: {
      ENV: envField.string({ context: "client", access: "public" }),

      PUBLIC_MESSAGE_DELAY_SEC: envField.number({
        context: "client",
        access: "public",
      }),
      PUBLIC_PB_URL: envField.string({ context: "client", access: "public" }),
      PUBLIC_POSTHOG_HOST: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_POSTHOG_TOKEN: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_CHAT_WIDGET_ID: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_CHAT_MAX_MESSAGE_TOKENS: envField.number({
        context: "client",
        access: "public",
      }),
      PB_ID: envField.string({ context: "server", access: "secret" }),
      PB_PASSWORD: envField.string({ context: "server", access: "secret" }),

      TG_TOKEN: envField.string({ context: "server", access: "secret" }),
      TG_ID: envField.string({ context: "server", access: "secret" }),

      AUTH_JWT_SECRET: envField.string({ context: "server", access: "secret" }),

      CRAWL4AI_URL: envField.string({ context: "server", access: "secret" }),

      QDRANT_URL: envField.string({ context: "server", access: "secret" }),
      QDRANT_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/shared/paraglide",
      }),
    ],
  },

  integrations: [
    svelte(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/app") && !page.includes("/api"),
    }),
  ],

  output: "server",
  adapter: node({
    mode: "middleware",
  }),
});
