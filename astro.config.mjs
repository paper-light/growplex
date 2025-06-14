// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://growplex.dev",
  env: {
    schema: {
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
      PUBLIC_CHAT_WIDGET_DOMAIN: envField.string({
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

      MAILGUN_TOKEN: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte(), sitemap(), mdx()],

  output: "server",
  adapter: node({
    mode: "middleware",
  }),
});
