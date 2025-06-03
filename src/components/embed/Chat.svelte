<script lang="ts">
  import { z } from "zod";
  import type { ChatSchema } from "@/models/chat";
  import { onMount } from "svelte";

  interface Props {
    chat: z.infer<typeof ChatSchema>;
  }

  const { chat }: Props = $props();

  let selectedDark = $state(false);

  onMount(() => {
    localStorage.getItem("theme") === "dark"
      ? (selectedDark = true)
      : (selectedDark = false);

    window.addEventListener("message", (event) => {
      if (event.origin !== chat.domain) return;
      const { type, theme } = event.data || {};
      if (type === "theme-change") {
        selectedDark = theme === "dark";
        document.documentElement.setAttribute("data-theme", theme);
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
