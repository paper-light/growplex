<script lang="ts">
  import { z } from "zod";
  import type { ChatSchema } from "@/models/chat";
  import { onMount } from "svelte";

  interface Props {
    chat: z.infer<typeof ChatSchema>;
  }

  const { chat }: Props = $props();

  let selectedDark = $state(false);
  let open = $state(false);

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

{#if open}
  <div class="fixed bottom-0 right-0 m-4 pb-12">
    <div class="shadow-lg rounded-lg p-4">
      <h2 class="text-xl font-bold">Chat</h2>
      <p>Chat content goes here...</p>
      <button onclick={() => (open = false)}>Close</button>
    </div>
  </div>
{:else}
  <div class="fixed bottom-0 right-0 m-4">
    <button
      class="bg-primary text-white rounded-full p-2 shadow-lg"
      onclick={() => (open = true)}
    >
      Chat
    </button>
  </div>
{/if}
