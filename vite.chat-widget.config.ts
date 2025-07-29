// vite.widget.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  publicDir: false,

  plugins: [
    svelte({
      compilerOptions: { accessors: true },
      emitCss: false,
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, "src/chat/widget/init.ts"),
      name: "ChatWidget",
      fileName: () => "chat-widget.js",
      formats: ["iife"],
    },
    outDir: resolve(__dirname, "public/scripts"),
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: Infinity,
    sourcemap: false,
    manifest: false,
    rollupOptions: {
      output: {
        entryFileNames: "chat-widget.js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
