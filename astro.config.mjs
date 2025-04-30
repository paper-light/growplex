// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://growplex.xyz",
  env: {
    schema: {
      PUBLIC_PB_URL: envField.string({ context: "client", access: "public" }),
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
