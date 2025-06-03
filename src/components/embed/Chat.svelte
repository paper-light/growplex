<script lang="ts">
  import { z } from "zod";
  import type { ChatSchema } from "@/models/chat";
  import { onMount } from "svelte";

  interface Props {
    chat: z.infer<typeof ChatSchema>;
  }

  const { chat }: Props = $props();

  onMount(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== chat.domain) return;
      console.log(event.data);
      const { type, newTheme } = event.data || {};
      if (type === "theme-change") {
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    });
  });
</script>

<div
  class="w-screen h-screen flex flex-col bg-base-100 shadow-lg rounded-lg p-4"
>
  <header>
    <h2 class="text-xl font-bold">Chat</h2>
  </header>

  <main class="flex-1">
    <p>Chat content goes here...</p>
  </main>

  <footer>FOOTER</footer>
</div>
