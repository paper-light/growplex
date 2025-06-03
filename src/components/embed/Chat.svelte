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
      const { type, newTheme } = event.data || {};
      if (type === "theme-change") {
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    });
  });
</script>

<!-- Chat Container -->
<div
  class="w-screen h-screen flex flex-col bg-base-100 shadow-lg rounded-lg p-4"
>
  <!-- Header -->
  <header class="border-b border-base-300 pb-2 mb-2">
    <h2 class="text-xl font-bold">Chat</h2>
  </header>

  <!-- Messages Area -->
  <main class="flex-1 overflow-y-auto space-y-2 p-2">
    <!-- Example incoming message -->
    <div class="chat chat-start">
      <div class="chat-image avatar">
        <div class="w-8 rounded-full">
          <img src="https://i.pravatar.cc/40?img=3" />
        </div>
      </div>
      <div class="chat-bubble bg-base-200 text-base-content">
        Hello there! How can I help you today?
      </div>
    </div>

    <!-- Example outgoing message -->
    <div class="chat chat-end">
      <div class="chat-bubble bg-primary text-primary-content">
        Hi! I wanted to ask about your pricing.
      </div>
      <div class="chat-image avatar">
        <div class="w-8 rounded-full">
          <img src="https://i.pravatar.cc/40?img=5" />
        </div>
      </div>
    </div>

    <!-- More messages will stack here -->
  </main>

  <!-- Footer with Input + Send Button -->
  <footer class="border-t border-base-300 pt-2 mt-2">
    <div class="flex gap-2">
      <input
        type="text"
        placeholder="Type your message…"
        class="input input-bordered flex-1"
      />
      <button class="btn btn-primary">Send</button>
    </div>
  </footer>
</div>
